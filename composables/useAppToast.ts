export function useAppToast() {
  const { $toast } = useNuxtApp();

  const info = (
    title: string,
    description?: string,
    opts: any = {},
  ) =>
    $toast(title, {
      description,
      duration: 3500,
      ...opts,
    });

  const success = (
    title: string,
    description?: string,
    opts: any = {},
  ) =>
    $toast.success(title, {
      description,
      duration: 3000,
      ...opts,
    });

  const error = (
    title: string,
    description?: string,
    opts: any = {},
  ) =>
    $toast.error(title, {
      description,
      duration: 6000,
      ...opts,
    });

  const promise = <T>(
    p: Promise<T>,
    messages: {
      loading?: string;
      success?: string | ((value: T) => string);
      error?: string | ((error: unknown) => string);
    },
    opts: any = {},
  ) =>
    $toast.promise(p, {
      loading: messages.loading ?? "Procesando…",
      success: messages.success ?? "Hecho",
      error:
        messages.error ??
        ((e: unknown) =>
          e instanceof Error ? e.message : "Error"),
      ...opts,
    });

  return {
    info,
    success,
    error,
    promise,
  };
}