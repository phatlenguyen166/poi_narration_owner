import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Badge";
import { useShopStore } from "@/stores/shopStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { MapStep } from "./MapStep";
import { ContentStep, type NarrationDraft } from "./ContentStep";
import { ownerService } from "@/services/ownerService";
import type { NarrationGuide } from "@/types";
import { env } from "@/lib/env";

const step1Schema = z.object({
  name: z.string().min(2, "Tên địa điểm tối thiểu 2 ký tự"),
  description: z.string().optional(),
  address: z.string().min(3, "Vui lòng nhập địa chỉ hoặc mô tả vị trí"),
  triggerRadiusMeters: z.number().min(1, "Bán kính phải lớn hơn 0"),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});

const step2Schema = z.object({
  lat: z.number({ error: "Vui lòng chọn vị trí" }),
  lng: z.number({ error: "Vui lòng chọn vị trí" }),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;

const STEPS = [
  { id: 1, label: "Thông tin địa điểm" },
  { id: 2, label: "Vị trí bản đồ" },
  { id: 3, label: "Nội dung thuyết minh" },
  { id: 4, label: "Xem lại & lưu" },
];

const resolvePreviewUrl = (value?: string) => {
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }
  return `${env.apiBaseUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

export default function ShopFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { shops, fetchShops, updateShop } = useShopStore();
  const isEdit = Boolean(id);
  const existingShop = isEdit
    ? shops.find((shop) => shop.id === id)
    : undefined;
  const prefilledShopName =
    !isEdit &&
    location.state &&
    typeof location.state === "object" &&
    "initialShopName" in location.state
      ? String(location.state.initialShopName ?? "")
      : "";

  const [step, setStep] = useState(1);
  const [step2Data, setStep2Data] = useState<Step2Data>({
    lat: 10.7769,
    lng: 106.7009,
  });
  const [narrationDraft, setNarrationDraft] = useState<NarrationDraft>({
    title: "",
    sourceText: "",
    sourceLanguageCode: "vi",
  });
  const [generatedGuides, setGeneratedGuides] = useState<NarrationGuide[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: existingShop?.name || prefilledShopName,
      description: existingShop?.description || "",
      address: existingShop?.address || "",
      triggerRadiusMeters: existingShop?.triggerRadiusMeters ?? 80,
      imageUrl: existingShop?.imageUrl || "",
      isActive: existingShop?.isActive ?? true,
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data,
  });

  useEffect(() => {
    if (!isEdit || !id) {
      setLoadingExisting(false);
      return;
    }

    let mounted = true;
    const hydrate = async () => {
      setLoadingExisting(true);
      try {
        const { shop, guides } = await ownerService.getStall(id);
        if (!mounted) return;

        form1.reset({
          name: shop.name,
          description: shop.description,
          address: shop.address,
          triggerRadiusMeters: shop.triggerRadiusMeters ?? 80,
          imageUrl: shop.imageUrl ?? "",
          isActive: shop.isActive,
        });

        const nextLocation = {
          lat: shop.latitude ?? 10.7769,
          lng: shop.longitude ?? 106.7009,
        };
        setStep2Data(nextLocation);
        form2.reset(nextLocation);
        setGeneratedGuides(guides);

        const vietnameseGuide = guides.find(
          (guide) => guide.languageCode === "vi",
        );
        setNarrationDraft({
          title: vietnameseGuide?.title ?? `Thuyết minh ${shop.name}`,
          sourceText: vietnameseGuide?.scriptText ?? "",
          sourceLanguageCode: "vi",
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu địa điểm",
        );
      } finally {
        if (mounted) {
          setLoadingExisting(false);
        }
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [form1, form2, id, isEdit]);

  const handleStep1Next = form1.handleSubmit(() => setStep(2));
  const handleStep2Next = form2.handleSubmit((data) => {
    setStep2Data(data);
    setStep(3);
  });

  const handleSave = async (submitApproval: boolean) => {
    setIsSubmitting(true);
    try {
      const basic = form1.getValues();

      const payload = {
        name: basic.name,
        description: basic.description ?? "",
        address: basic.address,
        latitude: step2Data.lat,
        longitude: step2Data.lng,
        triggerRadiusMeters: basic.triggerRadiusMeters,
        imageUrl: basic.imageUrl,
        isActive: basic.isActive,
      };

      const shop =
        isEdit && id
          ? await ownerService.updateStall(id, payload)
          : await ownerService.createStall(payload);

      let nextGuides: NarrationGuide[] = generatedGuides;
      if (submitApproval && narrationDraft.sourceText.trim()) {
        nextGuides = await ownerService.generateNarration(shop.id, {
          title: narrationDraft.title || `Thuyết minh ${basic.name}`,
          sourceText: narrationDraft.sourceText.trim(),
          sourceLanguageCode: "vi",
          active: basic.isActive,
          approvalStatus: submitApproval ? "PENDING" : "PENDING",
        });
      } else if (narrationDraft.sourceText.trim()) {
        const draftGuide = await ownerService.saveDraftNarration(shop.id, {
          languageCode: "vi",
          title: narrationDraft.title || `Thuyết minh ${basic.name}`,
          scriptText: narrationDraft.sourceText.trim(),
          active: basic.isActive,
          approvalStatus: "PENDING",
        });
        nextGuides = [draftGuide];
      }

      if (submitApproval) {
        await ownerService.submitApproval(shop.id);
      }

      setGeneratedGuides(nextGuides);
      await fetchShops();
      if (isEdit) {
        await updateShop(shop.id, {
          name: payload.name,
          description: payload.description,
          address: payload.address,
          latitude: payload.latitude,
          longitude: payload.longitude,
          triggerRadiusMeters: payload.triggerRadiusMeters,
          imageUrl: payload.imageUrl,
          isActive: payload.isActive,
        });
      }

      toast.success(
        submitApproval
          ? "Đã lưu địa điểm và gửi duyệt thành công"
          : "Đã lưu địa điểm và generate audio guide thành công",
      );
      navigate("/shops");
    } catch (error) {
      console.error(error);
      toast.error(
        "Không thể lưu địa điểm. Vui lòng kiểm tra backend và thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const step1Values = form1.watch();
  const imagePreviewUrl = resolvePreviewUrl(step1Values.imageUrl);
  const guideSummary = useMemo(
    () =>
      generatedGuides.map(
        (guide) =>
          `${guide.languageCode.toUpperCase()} · ${guide.audioDurationSeconds ?? 0}s`,
      ),
    [generatedGuides],
  );

  if (loadingExisting) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Đang tải dữ liệu địa điểm...
        </div>
      </div>
    );
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploaded = await ownerService.uploadImage(file);
      form1.setValue("imageUrl", uploaded.url, { shouldDirty: true });
      toast.success("Đã tải ảnh lên server");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải ảnh lên",
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/shops")}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Sửa địa điểm" : "Thêm địa điểm mới"}
        </h1>
      </div>

      <div className="mb-8 flex items-center overflow-x-auto pb-2">
        {STEPS.map((item, index) => (
          <div key={item.id} className="flex items-center">
            <button
              onClick={() => step > item.id && setStep(item.id)}
              className={cn(
                "flex items-center gap-2",
                step > item.id && "cursor-pointer",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  step > item.id && "bg-indigo-600 text-white",
                  step === item.id &&
                    "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900",
                  step < item.id &&
                    "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                )}
              >
                {step > item.id ? <Check size={14} /> : item.id}
              </div>
              <span
                className={cn(
                  "hidden whitespace-nowrap text-sm sm:block",
                  step === item.id
                    ? "font-semibold text-indigo-600"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                {item.label}
              </span>
            </button>
            {index < STEPS.length - 1 ? (
              <div
                className={cn(
                  "mx-3 h-0.5 min-w-8 flex-1 transition-colors",
                  step > item.id
                    ? "bg-indigo-600"
                    : "bg-gray-200 dark:bg-gray-700",
                )}
              />
            ) : null}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Thông tin địa điểm
          </h2>

          <Input
            label="Tên địa điểm"
            placeholder="Ví dụ: Landmark 81"
            required
            error={form1.formState.errors.name?.message}
            {...form1.register("name")}
          />

          <Textarea
            label="Mô tả ngắn"
            placeholder="Mô tả ngắn gọn về địa điểm..."
            rows={4}
            {...form1.register("description")}
          />

          <Input
            label="Địa chỉ"
            placeholder="Ví dụ: 720A Điện Biên Phủ, Bình Thạnh, TP.HCM"
            required
            error={form1.formState.errors.address?.message}
            {...form1.register("address")}
          />

          <Input
            label="Bán kính kích hoạt (m)"
            type="number"
            min={1}
            required
            error={form1.formState.errors.triggerRadiusMeters?.message}
            {...form1.register("triggerRadiusMeters", { valueAsNumber: true })}
          />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ảnh địa điểm
            </label>
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt={step1Values.name || "Ảnh địa điểm"}
                className="h-40 w-full rounded-xl object-cover"
              />
            ) : null}
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => void handleImageChange(event)}
              hint={isUploadingImage ? "Đang tải ảnh lên..." : "Ảnh sẽ được lưu trên server"}
              disabled={isUploadingImage}
            />
          </div>

          <Toggle
            checked={step1Values.isActive}
            onChange={(value) => form1.setValue("isActive", value)}
            label="Kích hoạt địa điểm ngay"
          />

          <div className="flex justify-end pt-2">
            <Button onClick={handleStep1Next}>
              Tiếp theo <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Vị trí địa điểm
          </h2>
          <MapStep form={form2} />
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft size={16} /> Quay lại
            </Button>
            <Button onClick={handleStep2Next}>
              Tiếp theo <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Nội dung thuyết minh
          </h2>
          <ContentStep
            draft={narrationDraft}
            onChange={setNarrationDraft}
            generatedGuides={generatedGuides}
          />
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft size={16} /> Quay lại
            </Button>
            <Button onClick={() => setStep(4)}>
              Tiếp theo <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Eye size={18} /> Xem lại thông tin
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Địa điểm
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {step1Values.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step1Values.description}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {step1Values.address}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {step2Data.lat.toFixed(6)}, {step2Data.lng.toFixed(6)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bán kính kích hoạt: {step1Values.triggerRadiusMeters}m
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Thuyết minh
                </h3>
                <p className="font-medium text-gray-900 dark:text-white">
                  {narrationDraft.title || `Thuyết minh ${step1Values.name}`}
                </p>
                <p className="line-clamp-6 text-sm text-gray-600 dark:text-gray-300">
                  {narrationDraft.sourceText ||
                    "Chưa nhập nội dung thuyết minh"}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {guideSummary.length > 0 ? (
                    guideSummary.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Sẽ generate mặc định 5 ngôn ngữ sau khi lưu
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ChevronLeft size={16} /> Quay lại
            </Button>
            <div className="flex gap-3">
              {/* <Button variant="secondary" onClick={() => void handleSave(false)} loading={isSubmitting}>
                Lưu địa điểm
              </Button> */}
              <Button
                onClick={() => void handleSave(true)}
                loading={isSubmitting}
              >
                Lưu và gửi duyệt
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
