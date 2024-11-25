"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Link, useRouter } from "@/i18n/routing";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchLogin } from "@/lib/client-functions";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRetry } from "@/hooks";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const DEFAULT_VALUES = {
  email: "",
  password: "",
};

export function LoginForm() {
  const t = useTranslations("login-form");
  const { isBlocked, blockTimeRemaining, resetBlock, handleFailedAttempt } =
    useRetry({
      maxFailedAttempts: 5,
      blockTime: 5,
      userKey: "login",
    });

  const router = useRouter();

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("email-invalid")),
        password: z.string().min(8, t("password-invalid")),
      }),
    [t]
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: fetchLogin,
    onSuccess: () => {
      resetBlock();
      router.replace("/dashboard");
    },
    onError: () => handleFailedAttempt(),
  });

  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      toast.promise(mutateAsync(data), {
        loading: t("login-loading"),
        success: t("login-success"),
        error: t("login-error"),
      });
    },
    [mutateAsync, t]
  );

  return (
    <Card className="min-w-[400px]">
      <CardHeader>
        <CardTitle>{t("form-title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email-label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="m@example.com"
                      disabled={isPending || isBlocked}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t("password-label")}</FormLabel>
                    <Link
                      tabIndex={-1}
                      href="/reset-password"
                      className="inline-block text-sm underline"
                    >
                      {t("forgot-password")}
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="********"
                      disabled={isPending || isBlocked}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isBlocked}
            >
              {isBlocked
                ? `${t("blocked")} (${blockTimeRemaining}s)`
                : t("submit")}
            </Button>
          </form>
        </Form>

        <Button variant="outline" className="mt-4">
          {t("google-login")}
        </Button>

        <Button
          onClick={() => router.replace("/register")}
          variant="ghost"
          className="mt-8"
        >
          {t("don't-have-account")}{" "}
          <span className="text-bold">{t("register")}</span>
        </Button>
      </CardContent>
    </Card>
  );
}