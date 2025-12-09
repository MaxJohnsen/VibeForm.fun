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
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ error: "workspaceId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's token to verify membership
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

    // Verify user is a member of the workspace using RPC
    const { data: isMember, error: memberCheckError } = await userClient
      .rpc("is_workspace_member", { _workspace_id: workspaceId, _user_id: user.id });

    if (memberCheckError) {
      console.error("Membership check error:", memberCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to verify membership" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isMember) {
      return new Response(
        JSON.stringify({ error: "Not a member of this workspace" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to access auth.users emails
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get workspace members
    const { data: members, error: membersError } = await serviceClient
      .from("workspace_members")
      .select("id, user_id, role, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch members" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user emails from auth.users using admin API
    const membersWithEmails = await Promise.all(
      (members || []).map(async (member) => {
        const { data: userData, error: userDataError } = await serviceClient.auth.admin.getUserById(member.user_id);
        
        if (userDataError) {
          console.error(`Error fetching user ${member.user_id}:`, userDataError);
          return {
            ...member,
            email: "Unknown",
          };
        }

        return {
          ...member,
          email: userData.user?.email || "Unknown",
        };
      })
    );

    console.log(`Returning ${membersWithEmails.length} members for workspace ${workspaceId}`);

    return new Response(
      JSON.stringify({ members: membersWithEmails }),
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
