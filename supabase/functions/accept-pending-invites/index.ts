import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing pending invites for user: ${user.id}, email: ${user.email}`);

    // Use service role to access invites (RLS restricts access)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Find pending invites for this user's email
    const { data: invites, error: invitesError } = await serviceClient
      .from("workspace_invites")
      .select("id, workspace_id, role")
      .ilike("email", user.email || "");

    if (invitesError) {
      console.error("Error fetching invites:", invitesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch invites" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${invites?.length || 0} pending invites`);

    if (!invites || invites.length === 0) {
      return new Response(
        JSON.stringify({ accepted: 0, workspaces: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const acceptedWorkspaces: string[] = [];

    // Process each invite
    for (const invite of invites) {
      // Check if user is already a member
      const { data: existingMember } = await serviceClient
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", invite.workspace_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        console.log(`User already member of workspace ${invite.workspace_id}, deleting invite`);
        await serviceClient.from("workspace_invites").delete().eq("id", invite.id);
        continue;
      }

      // Add user to workspace
      const { error: memberError } = await serviceClient
        .from("workspace_members")
        .insert({
          workspace_id: invite.workspace_id,
          user_id: user.id,
          role: invite.role,
        });

      if (memberError) {
        console.error(`Error adding user to workspace ${invite.workspace_id}:`, memberError);
        continue;
      }

      // Delete the invite
      const { error: deleteError } = await serviceClient
        .from("workspace_invites")
        .delete()
        .eq("id", invite.id);

      if (deleteError) {
        console.error(`Error deleting invite ${invite.id}:`, deleteError);
      }

      acceptedWorkspaces.push(invite.workspace_id);
      console.log(`User added to workspace ${invite.workspace_id} with role ${invite.role}`);
    }

    return new Response(
      JSON.stringify({ 
        accepted: acceptedWorkspaces.length, 
        workspaces: acceptedWorkspaces 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
