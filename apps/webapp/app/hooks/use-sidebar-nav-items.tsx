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
  const { isAdmin, canUseBookings, subscription, unreadUpdatesCount } =
    useLoaderData<typeof loader>();
  const { isBaseOrSelfService } = useUserRoleHelper();
  const currentOrganization = useCurrentOrganization();
  const isPersonalOrganization = isPersonalOrg(currentOrganization);

  const bookingDisabled = useMemo(() => {
    if (canUseBookings) {
      return false;
    }

    return {
      reason: (
        <div>
          <h5>Uitgeschakeld</h5>
          <p>
            Reserveren is een premium functie die alleen beschikbaar is voor Team-werkruimtes.
          </p>

          <When truthy={!!subscription} fallback={<UpgradeMessage />}>
            <p>Schakel over naar uw team-werkruimte om toegang te krijgen tot deze functie.</p>
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
      to: "/home",
      Icon: HomeIcon,
      hidden: isBaseOrSelfService,
    },
    {
      type: "child",
      title: "Assets",
      to: "/assets",
      Icon: PackageOpenIcon,
    },
    {
      type: "child",
      title: "Kits",
      to: "/kits",
      Icon: Package,
    },
    {
      type: "child",
      title: "Categorieën",
      to: "/categories",
      Icon: BoxesIcon,
      hidden: isBaseOrSelfService,
    },

    {
      type: "child",
      title: "Tags",
      to: "/tags",
      Icon: TagsIcon,
      hidden: isBaseOrSelfService,
    },
    {
      type: "child",
      title: "Locaties",
      to: "/locations",
      Icon: MapPinIcon,
      hidden: isBaseOrSelfService,
    },
    {
      type: "child",
      title: "Audits",
      to: "/audits",
      Icon: ClipboardCheckIcon,
    },
    {
      type: "parent",
      title: "Reserveringen",
      Icon: CalendarRangeIcon,
      disabled: bookingDisabled,
      children: [
        {
          title: "Bekijk Reserveringen",
          to: "/bookings",
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
      hidden: isBaseOrSelfService,
      to: "/reminders",
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
      hidden: isBaseOrSelfService,
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
      hidden: isBaseOrSelfService,
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
      to: "/scanner",
      Icon: ScanBarcodeIcon,
    },
    {
      type: "button",
      title: "Vragen/Feedback",
      Icon: MessageCircleIcon,
      onClick: () => {
        // Handled by FeedbackNavItem in sidebar-nav.tsx
      },
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
