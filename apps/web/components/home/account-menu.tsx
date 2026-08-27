"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/components/home/use-sign-out";

// IAM-002 (SCREEN_INVENTORY.md "Cross-cutting / Global Navigation"): the
// authenticated header slot is a dropdown, not a direct link — Dashboard and
// Akun saya are separate destinations, and Keluar is an action, not a route.
const ITEM_CLASSNAME =
  "block w-full cursor-pointer rounded-control px-3 py-2 text-left text-body text-brand-ink outline-none data-[highlighted]:bg-brand-ink/5";

export function AccountMenu() {
  const handleSignOut = useSignOut();

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            size="sm"
            className="rounded-control border-2 border-brand-ink bg-brand-amber px-4 font-bold text-brand-ink shadow-hard-sm transition-transform duration-150 ease-out hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
          />
        }
      >
        Akun
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8}>
          <Menu.Popup className="flex min-w-[200px] flex-col gap-1 rounded-card border-2 border-brand-ink bg-surface p-2 shadow-hard-sm">
            {/* Base UI's Menu.LinkItem defaults closeOnClick to false (unlike
                Menu.Item's true — see node_modules/@base-ui/react/menu/link-item
                /MenuLinkItem.mjs). Left at the default, a plain click navigates
                correctly but leaves the dropdown open. We want the common case
                (plain click) to close the menu; Base UI's shared onClick handler
                doesn't distinguish modifier-clicks (Ctrl/Cmd/middle-click for
                "open in new tab") from plain ones before closing, so opening a
                link in a new tab also closes the menu in the current tab —
                accepted trade-off, plain click is far more common. */}
            <Menu.LinkItem
              render={<Link href="/dashboard" />}
              className={ITEM_CLASSNAME}
              closeOnClick
            >
              Dashboard
            </Menu.LinkItem>
            <Menu.LinkItem render={<Link href="/account" />} className={ITEM_CLASSNAME} closeOnClick>
              Akun saya
            </Menu.LinkItem>
            <Menu.LinkItem render={<Link href="/account/orders" />} className={ITEM_CLASSNAME} closeOnClick>
              Riwayat pembelian
            </Menu.LinkItem>
            <Menu.Item
              nativeButton
              render={<button type="button" />}
              className={ITEM_CLASSNAME}
              onClick={handleSignOut}
            >
              Keluar
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
