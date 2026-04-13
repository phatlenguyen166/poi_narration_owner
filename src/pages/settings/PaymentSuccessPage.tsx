import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { settingsApi } from "@/apis/settingsApi";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const hasCaptured = useRef(false); // Chống call API 2 lần do React StrictMode

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // Defer state updates to avoid synchronous setState within effect (cascading renders)
      setTimeout(() => {
        setStatus("error");
        setErrorMessage("Không tìm thấy mã giao dịch hợp lệ.");
      }, 0);
      return;
    }

    if (hasCaptured.current) return;
    hasCaptured.current = true;

    const capture = async () => {
      try {
        const response = await settingsApi.capturePayment(token);

        if (response.isSuccess) {
          setStatus("success");
          // Cập nhật lại user data trong store
          await refreshProfile();
        } else {
          setStatus("error");
          setErrorMessage("Thanh toán thất bại hoặc đã bị huỷ.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi xác nhận thanh toán.",
        );
      }
    };

    void capture();
  }, [searchParams, refreshProfile]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-lg">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <Loader2 size={48} className="text-orange-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Đang xác nhận thanh toán...
            </h2>
            <p className="text-gray-500">
              Vui lòng không đóng trình duyệt trong lúc này.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle size={56} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-500">
              Gói dịch vụ của bạn đã được nâng cấp. Cảm ơn bạn đã sử dụng Audio
              Tour.
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => navigate("/settings")}
            >
              Quay lại Cài đặt
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <XCircle size={56} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Thanh toán thất bại
            </h2>
            <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/settings")}
              >
                Về Cài đặt
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
