'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function SuccessPage() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Invalidate subscription query to refresh data immediately
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        queryClient.invalidateQueries({ queryKey: ['quota'] });
    }, [queryClient]);

    return (
        <div className="container mx-auto flex h-screen items-center justify-center px-4">
            <Card className="max-w-md w-full text-center border-green-200 bg-green-50 shadow-lg">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
                    <CardDescription className="text-green-700">
                        Thank you for upgrading to Pro. Your account has been updated.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You now have unlimited access to all AI features and trip generations.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
