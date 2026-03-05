"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Globe,
  Bell,
  HelpCircle,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={[
      "group relative inline-flex h-7 w-12 items-center rounded-full px-1",
      "transition-[background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
      checked
        ? "bg-[#00E5FF]/90 shadow-[0_0_0_2px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,229,255,0.35)]"
        : "bg-gray-600/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
      "cursor-pointer",
    ].join(" ")}
  >
    <span
      className={[
        "pointer-events-none absolute h-5 w-5 rounded-full bg-white shadow-md",
        "transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "group-active:scale-95",
        checked ? "translate-x-5" : "translate-x-0",
      ].join(" ")}
    />
  </button>
);

type Language = "vi" | "en";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "vi", label: "vietnamese" },
  { value: "en", label: "english" },
];

interface NotificationSetting {
  label: string;
  desc: string;
  value: boolean;
  setValue: (value: boolean) => void;
}

interface SupportItem {
  icon: typeof HelpCircle;
  text: string;
}

interface Props {
  readonly userProfile: {
    name: string;
    email: string;
    phone?: string;
    username?: string;
    avatarUrl?: string | null;
  };
}

export default function SettingsPanel(_: Props) {
  const t = useTranslations("Profile");
  const [language, setLanguage] = useState<Language>("vi");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);

  const notificationSettings: NotificationSetting[] = useMemo(
    () => [
      {
        label: "pushNotifications",
        desc: "pushNotificationsDesc",
        value: pushNotifications,
        setValue: setPushNotifications,
      },
      {
        label: "emailNotifications",
        desc: "emailNotificationsDesc",
        value: emailNotifications,
        setValue: setEmailNotifications,
      },
      {
        label: "marketingEmails",
        desc: "marketingEmailsDesc",
        value: marketingEmails,
        setValue: setMarketingEmails,
      },
    ],
    [pushNotifications, emailNotifications, marketingEmails]
  );

  const supportItems: SupportItem[] = useMemo(
    () => [
      { icon: HelpCircle, text: "helpCenter" },
      { icon: MessageCircle, text: "contactSupport" },
      { icon: AlertTriangle, text: "reportBug" },
    ],
    []
  );

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLanguage(e.target.value as Language);
    },
    []
  );

  const handleNotificationToggle = useCallback(
    (setValue: (value: boolean) => void, currentValue: boolean) => {
      setValue(!currentValue);
    },
    []
  );

  return (
    <div className="space-y-6 pb-9">
      {/* Language */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#00E5FF]" />
          <h3 className="text-white text-lg font-medium">{t("language")}</h3>
        </div>
        <div className="bg-[#17202F] rounded-xl p-4 space-y-2">
          {LANGUAGES.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
            >
              <div className="relative">
                <input
                  type="radio"
                  name="language"
                  value={value}
                  checked={language === value}
                  onChange={handleLanguageChange}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 peer-checked:border-[#00E5FF] transition-all duration-300 relative shadow-sm">
                  {language === value && (
                    <div className="absolute inset-0 bg-[#00E5FF] rounded-full scale-50 animate-in fade-in duration-300 shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                  )}
                </div>
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  language === value ? "text-[#00E5FF]" : "text-white"
                }`}
              >
                {t(label)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00E5FF]" />
          <h3 className="text-white text-lg font-medium">
            {t("notificationPreferences")}
          </h3>
        </div>
        <div className="bg-[#17202F] rounded-xl p-4 space-y-4">
          {notificationSettings.map(({ label, desc, value, setValue }) => (
            <div key={label} className="flex items-center justify-between py-2">
              <div>
                <div className="text-white font-medium">{t(label)}</div>
                <div className="text-gray-400 text-sm mt-1">{t(desc)}</div>
              </div>
              <ToggleSwitch
                checked={value}
                onChange={() => handleNotificationToggle(setValue, value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#00E5FF]" />
          <h3 className="text-white text-lg font-medium">{t("support")}</h3>
        </div>
        <div className="bg-[#17202F] rounded-xl p-4 space-y-3">
          {supportItems.map(({ icon: Icon, text }) => (
            <button
              key={text}
              className="flex items-center gap-3 w-full text-left hover:bg-white/5 p-3 rounded-lg transition-all duration-200 group cursor-pointer"
            >
              <Icon className="w-5 h-5 text-white/70 group-hover:text-[#00E5FF] transition-all duration-200 group-hover:scale-110" />
              <span className="text-white transition-all duration-200 group-hover:translate-x-1">
                {t(text)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
