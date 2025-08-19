import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider data-oid=":_rgby8">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} data-oid="ykjngkn">
            <div className="grid gap-1" data-oid="xawwdde">
              {title && <ToastTitle data-oid="omv4li-">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-oid="7l-sriv">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-oid="8j6hka2" />
          </Toast>
        );
      })}
      <ToastViewport data-oid="zf_5whr" />
    </ToastProvider>
  );
}
