import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { changePassword } from "@/api/authApi";

const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(8, "Old password must be at least 8 characters"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
        confirmNewPassword: z.string().min(8, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
    });

type FormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        try {
            await changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            toast.success("Password changed successfully");
            navigate("/cases", { replace: true });
        } catch (err: any) {
            toast.error(err.message || "Failed to change password");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container max-w-md mx-auto py-12">
            <Card className="border-none shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Change Password
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="oldPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Old Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmNewPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Changing…
                                    </>
                                ) : (
                                    "Change Password"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="text-center">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
