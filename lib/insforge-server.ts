import { createClient } from '@insforge/sdk';
import { auth } from "@insforge/nextjs/server";

export async function getAuthenticatedClient() {
  const { token, user } = await auth();


  const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    edgeFunctionToken: token || undefined,
    autoRefreshToken: true

  });

  return { insforge, user }
}