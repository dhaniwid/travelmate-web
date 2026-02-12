'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
    return (
        <div className="container mx-auto flex h-screen items-center justify-center px-4">
            <Card className="max-w-md w-full text-center border-red-200 bg-red-50 shadow-lg">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-800">Payment Cancelled</CardTitle>
                    <CardDescription className="text-red-700">
                        Your payment process was cancelled. No charges were made.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        If you encountered an issue, please try again or contact support.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-3">
                    <Button asChild className="w-full" variant="default">
                        <Link href="/pricing">Try Again</Link>
                    </Button>
                    <Button asChild className="w-full" variant="ghost">
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
