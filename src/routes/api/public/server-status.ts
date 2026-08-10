import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export const Route = createFileRoute('/api/public/server-status')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', 'server_status')
            .maybeSingle();
            
          return new Response(JSON.stringify({ status: data?.value || 'Online' }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ status: 'Online' }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }
})
