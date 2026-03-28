/**
 * Navbar Component
 *
 * Server Component — reads auth state from the vtx_token cookie via
 * getIsAuthenticated() and renders different navigation links accordingly.
 *
 * Guest layout:
 *   Left:   Premium | About Us
 *   Center: Logo
 *   Right:  Sign Up | Log In | Color theme | Dark/Light toggle
 *
 * Authenticated layout:
 *   Left:   Market | Wallet
 *   Center: Logo
 *   Right:  Settings (gear) | Log Out | Color theme | Dark/Light toggle
 *
 * The floating pill that appears on scroll and the mobile hamburger drawer
 * are handled by NavbarClient (client component) which receives isLoggedIn
 * as a prop so the server component stays the source of truth.
 */

import { getIsAuthenticated } from '@/lib/actions';
import NavbarClient from '@/components/NavbarClient';

export default async function Navbar() {
  const isLoggedIn = await getIsAuthenticated();
  return <NavbarClient isLoggedIn={isLoggedIn} />;
}
