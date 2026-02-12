import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    onButtonClick?: () => void;
    isLoading?: boolean;
    isCurrent?: boolean;
    isPopular?: boolean;
}

export function PricingCard({
    title,
    price,
    description,
    features,
    buttonText,
    onButtonClick,
    isLoading = false,
    isCurrent = false,
    isPopular = false,
}: PricingCardProps) {
    return (
        <Card className={cn(
            "w-full max-w-sm flex flex-col relative transition-all duration-200 hover:shadow-lg border-2",
            isPopular ? "border-primary shadow-md scale-105 z-10" : "border-border",
            isCurrent ? "bg-muted/50" : ""
        )}>
            {isPopular && (
                <div className="absolute -top-3 left-0 right-0 max-w-fit mx-auto bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-4xl font-bold mb-6">
                    {price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/ month</span>
                </div>
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={onButtonClick}
                    disabled={isLoading || isCurrent}
                    variant={isPopular ? "default" : "outline"}
                >
                    {isCurrent ? "Current Plan" : isLoading ? "Processing..." : buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
}
