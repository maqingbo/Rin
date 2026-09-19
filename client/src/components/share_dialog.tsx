import { useState } from "react";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";

export function ShareDialog({
  url,
  open,
  onClose,
}: {
  url: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore copy failures
    }
  }

  return (
    <Modal
      isOpen={open}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      onRequestClose={onClose}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          padding: "0",
          border: "none",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          background: "transparent",
          maxWidth: "40em",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        },
      }}
    >
      <div className="flex flex-col items-stretch p-6 bg-w w-full min-w-72 sm:min-w-96">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium t-primary">{t("share.title")}</h2>
          <button
            onClick={onClose}
            aria-label={t("share.close")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 微信：二维码 */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200/70 p-4">
            <span
              className="flex items-center gap-1.5 text-base font-medium"
              style={{ color: "#07C160" }}
            >
              <i className="ri-wechat-fill text-xl" />
              {t("share.wechat")}
            </span>
            <div className="rounded-lg bg-white p-2 border border-neutral-100">
              <QRCodeSVG value={url} size={160} level="M" />
            </div>
            <p className="text-xs t-secondary text-center leading-relaxed">
              {t("share.wechat_tip")}
            </p>
          </div>

          {/* 复制链接 */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200/70 p-4">
            <span className="flex items-center gap-1.5 text-base font-medium text-theme">
              <i className="ri-file-copy-line text-xl" />
              {t("share.copy_link")}
            </span>
              <button
              onClick={copyLink}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-full bg-theme text-white px-4 py-2.5 text-sm transition-opacity hover:opacity-90"
            >
              <i className="ri-file-copy-line" />
              {copied ? t("share.copied") : t("share.copy_action")}
            </button>
            <p className="text-xs t-secondary text-center break-all leading-relaxed">
              {url}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
