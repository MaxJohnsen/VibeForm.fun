import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface InviteRequest {
  workspaceId: string;
  email: string;
  role: "admin" | "member";
  appUrl: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { workspaceId, email, role, appUrl }: InviteRequest = await req.json();

    if (!workspaceId || !email || !role || !["admin", "member"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate appUrl is a valid HTTPS URL
    if (!appUrl || (!appUrl.startsWith('https://') && !appUrl.startsWith('http://localhost'))) {
      return new Response(JSON.stringify({ error: "Invalid app URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: isAdmin } = await supabaseAdmin.rpc("is_workspace_admin", {
      _workspace_id: workspaceId,
      _user_id: user.id,
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Only admins can invite members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: workspace } = await supabaseAdmin.from("workspaces").select("name").eq("id", workspaceId).single();

    if (!workspace) {
      return new Response(JSON.stringify({ error: "Workspace not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the invite
    const { error: inviteError } = await supabaseAdmin
      .from("workspace_invites")
      .insert({ workspace_id: workspaceId, email: email.toLowerCase(), role, invited_by: user.id });

    if (inviteError) {
      console.error("Failed to create invite:", inviteError);
      return new Response(
        JSON.stringify({
          error: inviteError.message.includes("duplicate")
            ? "An invite already exists for this email"
            : "Failed to create invite",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Send email via Resend
    const apiKey = Deno.env.get("RESEND_API_KEY");

    console.log(`Sending invite email to ${email} for workspace ${workspace.name}, appUrl: ${appUrl}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Fairform <noreply@fairform.io>",
        to: [email],
        subject: `You've been invited to join ${workspace.name} on Fairform`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h1 style="color:#14b8a6;">Fairform</h1>
          <div style="background:#f8fafc;border-radius:12px;padding:30px;">
            <h2>You've been invited!</h2>
            <p>${user.email} invited you to join <strong>${workspace.name}</strong> as a <strong>${role}</strong>.</p>
            <a href="${appUrl}/signup" style="display:inline-block;background:#8b5cf6;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;">Accept Invitation</a>
          </div>
        </div>`,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Email error:", await emailResponse.text());
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
