"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  show: boolean;
  onToggle?: () => void;
  fieldKey: string;
  onChange: (fieldKey: string, value: string) => void;
  placeholder: string;
  showToggle?: boolean;
  autoComplete?: string;
}

const PasswordField = ({
  id,
  label,
  value,
  show,
  onToggle,
  fieldKey,
  onChange,
  placeholder,
  showToggle = true,
  autoComplete,
}: PasswordFieldProps) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm text-gray-300">
      {label} <span className="text-red-400">*</span>
    </label>
    <div className="relative">
      <Input
        type={showToggle && show ? "text" : "password"}
        id={id}
        value={value}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`h-12 bg-transparent border-white/10 text-white placeholder:text-gray-500 focus:border-[#00E5FF]/50 ${
          showToggle ? "pr-10" : "pr-4"
        }`}
      />
      {showToggle && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 text-gray-400 transition-colors -translate-y-1/2 hover:text-white cursor-pointer"
        >
          {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      )}
    </div>
  </div>
);

type PasswordType = "current" | "new" | "reEnter";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  username?: string;
  avatarUrl?: string | null;
}

interface Props {
  readonly userProfile: UserProfile;
  readonly onProfileUpdated?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SecurityPanel({
  userProfile,
  onProfileUpdated,
}: Props) {
  const t = useTranslations("Profile");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    reEnter: "",
  });
  const [showPasswords, setShowPasswords] = useState<{
    current: boolean;
    new: boolean;
    reEnter: boolean;
  }>({
    current: false,
    new: false,
    reEnter: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = useCallback(
    (fieldKey: string, value: string) => {
      setPasswords((prev) => ({ ...prev, [fieldKey]: value }));
    },
    []
  );

  const togglePasswordVisibility = useCallback((field: PasswordType) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const requirements = useMemo(
    () => ({
      hasCurrentPassword: passwords.current.length > 0,
      minLength: passwords.new.length >= 8 && passwords.new.length <= 20,
      hasChars:
        /\d/.test(passwords.new) &&
        /[A-Z]/.test(passwords.new) &&
        /[a-z]/.test(passwords.new),
      hasSpecial: /[!@#$%&*(),._]/.test(passwords.new),
      matches:
        passwords.new === passwords.reEnter && passwords.reEnter.length > 0,
      notSameAsCurrent:
        passwords.new !== passwords.current && passwords.new.length > 0,
    }),

    [passwords]
  );

  const canSave = useMemo(() => {
    if (!requirements.hasCurrentPassword) return false;

    const passwordRequirements = [
      requirements.minLength,
      requirements.hasChars,
      requirements.hasSpecial,
      requirements.matches,
      requirements.notSameAsCurrent,
    ];

    return passwordRequirements.every(Boolean);
  }, [requirements]);

  const requirementList = useMemo(
    () => [
      {
        condition: requirements.minLength,
        text: t("passwordRequirements.length"),
      },
      {
        condition: requirements.hasChars,
        text: t("passwordRequirements.characters"),
      },
      {
        condition: requirements.hasSpecial,
        text: t("passwordRequirements.special"),
      },
    ],
    [requirements.minLength, requirements.hasChars, requirements.hasSpecial, t]
  );

  const handleSave = useCallback(async () => {
    if (isChangingPassword) return;

    if (!canSave) {
      alert("Vui lòng kiểm tra lại thông tin mật khẩu");
      return;
    }

    try {
      setIsChangingPassword(true);

      // Call change password service
      const { changePassword } = await import("@/services/client");
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.reEnter,
      });

      alert("Đổi mật khẩu thành công!");
      setPasswords({
        current: "",
        new: "",
        reEnter: "",
      });
      setShowPasswords({
        current: false,
        new: false,
        reEnter: false,
      });
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      // SECURITY: Do not log full error object which may contain sensitive data
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi đổi mật khẩu";
      // Error already handled by errorMessage state
      alert(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  }, [canSave, isChangingPassword, passwords, onProfileUpdated]);

  return (
    <>
      <AnimatePresence>
        {isChangingPassword && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <LoadingOverlay message="Changing password..." />
          </div>
        )}
      </AnimatePresence>

      <div className="pb-9 space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <Lock className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="text-lg font-medium text-white">
              {t("changePassword")}
            </h3>
          </div>
          <div className="bg-[#17202F] rounded-xl p-6 space-y-5">
            <PasswordField
              id="current-password"
              label={t("currentPassword")}
              value={passwords.current}
              show={false}
              fieldKey="current"
              onChange={handlePasswordChange}
              placeholder="Nhập mật khẩu hiện tại"
              showToggle={false}
              autoComplete="new-password"
            />
            <PasswordField
              id="new-password"
              label={t("newPassword")}
              value={passwords.new}
              show={showPasswords.new}
              onToggle={() => togglePasswordVisibility("new")}
              fieldKey="new"
              onChange={handlePasswordChange}
              placeholder={t("enterInformation")}
              autoComplete="new-password"
            />
            <PasswordField
              id="re-enter-password"
              label={t("reenterPassword")}
              value={passwords.reEnter}
              show={showPasswords.reEnter}
              onToggle={() => togglePasswordVisibility("reEnter")}
              fieldKey="reEnter"
              onChange={handlePasswordChange}
              placeholder={t("enterInformation")}
              autoComplete="new-password"
            />

            <div className="pt-2 space-y-2">
              {requirementList.map(({ condition, text }) => (
                <div
                  key={text}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    condition ? "text-white" : "text-gray-400"
                  }`}
                >
                  <Check
                    className={`w-4 h-4 ${
                      condition ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={!canSave || isChangingPassword}
                size="lg"
                className="bg-[#00C8FF] hover:bg-[#00B8E6] hover:text-black text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
                    <span className="animate-pulse">Đang thay đổi...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("saveChanges")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
