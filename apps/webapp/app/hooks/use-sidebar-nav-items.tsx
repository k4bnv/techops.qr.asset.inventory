import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  AlarmClockIcon,
  BellIcon,
  BoxesIcon,
  CalendarRangeIcon,
  ChartLineIcon,
  ClipboardCheckIcon,
  HomeIcon,
  MapPinIcon,
  MessageCircleIcon,
  Package,
  PackageOpenIcon,
  QrCodeIcon,
  ScanBarcodeIcon,
  SettingsIcon,
  TagsIcon,
  UsersRoundIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import { useLoaderData } from "react-router";
import { UpgradeMessage } from "~/components/marketing/upgrade-message";
import When from "~/components/when/when";
import type { loader } from "~/routes/_layout+/_layout";
import { isPersonalOrg } from "~/utils/organization";
import { useCurrentOrganization } from "./use-current-organization";
import { useUserRoleHelper } from "./user-user-role-helper";

type BaseNavItem = {
  title: string;
  hidden?: boolean;
  Icon: LucideIcon;
  disabled?: boolean | { reason: ReactNode };
  badge?: {
    show: boolean;
    variant?: "unread";
  };
};

export type ChildNavItem = BaseNavItem & {
  type: "child";
  to: string;
  target?: string;
};

export type ParentNavItem = BaseNavItem & {
  type: "parent";
  children: Omit<ChildNavItem, "type" | "Icon">[];
};

type LabelNavItem = Omit<BaseNavItem, "Icon"> & {
  type: "label";
};

type ButtonNavItem = BaseNavItem & {
  type: "button";
  onClick: () => void;
};

export type NavItem =
  | ChildNavItem
  | ParentNavItem
  | LabelNavItem
  | ButtonNavItem;

export function useSidebarNavItems() {
  const {
    isAdmin,
    canUseBookings,
    subscription,
    unreadUpdatesCount,
    navSettings,
  } = useLoaderData<typeof loader>();
  const { isBaseOrSelfService } = useUserRoleHelper();
  const currentOrganization = useCurrentOrganization();
  const isPersonalOrganization = isPersonalOrg(currentOrganization);

  // Helper: resolve URL - use customUrl if set, otherwise fallback
  const url = (key: keyof typeof navSettings, fallback: string) =>
    navSettings?.[key]?.customUrl || fallback;

  // Helper: is item visible per admin settings (null-safe, default true)
  const nav = (key: keyof typeof navSettings) =>
    navSettings?.[key]?.visible !== false;

  const bookingDisabled = useMemo(() => {
    if (canUseBookings) {
      return false;
    }

    return {
      reason: (
        <div>
          <h5>Uitgeschakeld</h5>
          <p>
            Reserveren is een premium functie die alleen beschikbaar is voor
            Team-werkruimtes.
          </p>

          <When truthy={!!subscription} fallback={<UpgradeMessage />}>
            <p>
              Schakel over naar uw team-werkruimte om toegang te krijgen tot
              deze functie.
            </p>
          </When>
        </div>
      ),
    };
  }, [canUseBookings, subscription]);

  const topMenuItems: NavItem[] = [
    {
      type: "child",
      title: "Beheerdersdashboard",
      to: "/admin-dashboard/users",
      Icon: ChartLineIcon,
      hidden: !isAdmin,
    },
    {
      type: "label",
      title: "Assetbeheer",
    },
    {
      type: "child",
      title: "Startpagina",
      to: url("home", "/home"),
      Icon: HomeIcon,
      hidden: !nav("home") || isBaseOrSelfService,
    },
    {
      type: "child",
      title: "Assets",
      to: url("assets", "/assets"),
      Icon: PackageOpenIcon,
      hidden: !nav("assets"),
    },
    {
      type: "child",
      title: "Kits",
      to: url("kits", "/kits"),
      Icon: Package,
      hidden: !nav("kits"),
    },
    {
      type: "child",
      title: "Categorieën",
      to: url("categories", "/categories"),
      Icon: BoxesIcon,
      hidden: !nav("categories") || isBaseOrSelfService,
    },
    {
      type: "child",
      title: "Tags",
      to: url("tags", "/tags"),
      Icon: TagsIcon,
      hidden: !nav("tags") || isBaseOrSelfService,
    },
    {
      type: "child",
      title: "Locaties",
      to: url("locations", "/locations"),
      Icon: MapPinIcon,
      hidden: !nav("locations") || isBaseOrSelfService,
    },
    {
      type: "child",
      title: "Audits",
      to: url("audits", "/audits"),
      Icon: ClipboardCheckIcon,
      hidden: !nav("audits"),
    },
    {
      type: "parent",
      title: "Reserveringen",
      Icon: CalendarRangeIcon,
      disabled: bookingDisabled,
      hidden: !nav("bookings"),
      children: [
        {
          title: "Bekijk Reserveringen",
          to: url("bookings", "/bookings"),
          disabled: bookingDisabled,
        },
        {
          title: "Kalender",
          to: "/calendar",
          disabled: bookingDisabled,
        },
      ],
    },
    {
      type: "child",
      title: "Herinneringen",
      Icon: AlarmClockIcon,
      hidden: !nav("reminders") || isBaseOrSelfService,
      to: url("reminders", "/reminders"),
    },
    {
      type: "child",
      title: "Reparaties",
      Icon: WrenchIcon,
      hidden: !nav("repairs") || isBaseOrSelfService,
      to: url("repairs", "/repairs"),
    },
    {
      type: "label",
      title: "Organisatie",
      hidden: isBaseOrSelfService,
    },
    {
      type: "parent",
      title: "Team",
      Icon: UsersRoundIcon,
      hidden: !nav("team") || isBaseOrSelfService,
      children: [
        {
          title: "Gebruikers",
          to: "/settings/team/users",
          hidden: isPersonalOrganization,
        },
        {
          title: "Uitnodigingen",
          to: "/settings/team/invites",
          hidden: isPersonalOrganization,
        },
        {
          title: "Niet-geregistreerde leden",
          to: "/settings/team/nrm",
        },
      ],
    },
    {
      type: "parent",
      title: "Werkruimte-instellingen",
      Icon: SettingsIcon,
      hidden: !nav("workspaceSettings") || isBaseOrSelfService,
      children: [
        {
          title: "Algemeen",
          to: "/settings/general",
        },
        {
          title: "Reserveringen",
          to: "/settings/bookings",
          hidden: isPersonalOrganization,
        },
        {
          title: "Aangepaste velden",
          to: "/settings/custom-fields",
        },
      ],
    },
  ];

  const bottomMenuItems: NavItem[] = [
    {
      type: "child",
      title: "QR Scanner",
      to: url("scanner", "/scanner"),
      Icon: ScanBarcodeIcon,
      hidden: !nav("scanner"),
    },
    {
      type: "child",
      title: "Vragen/Feedback",
      Icon: MessageCircleIcon,
      to: url("feedback", "#"),
      target: navSettings?.feedback?.customUrl ? "_blank" : undefined,
      hidden: !nav("feedback"),
    },
    {
      type: "child",
      title: "Support",
      Icon: MessageCircleIcon,
      to: url("support", "#"),
      target: navSettings?.support?.customUrl ? "_blank" : undefined,
      hidden: !nav("support"),
    },
  ];

  return {
    topMenuItems: removeHiddenNavItems(topMenuItems),
    bottomMenuItems: removeHiddenNavItems(bottomMenuItems),
  };
}

function removeHiddenNavItems(navItems: NavItem[]) {
  return navItems
    .filter((item) => !item.hidden)
    .map((item) => {
      if (item.type === "parent") {
        return {
          ...item,
          children: item.children.filter((child) => !child.hidden),
        };
      }

      return item;
    });
}
