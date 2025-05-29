import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

interface TokenData {
  name: string;
  symbol: string;
  status: 'halal' | 'haram' | 'pending';
  reasons?: string[];
}

const mockTokens: TokenData[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    status: "halal",
    reasons: ["Compliant with Islamic finance principles", "Used as a medium of exchange"]
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    status: "pending",
    reasons: ["Under review for smart contract compliance"]
  }
];

const HalalScreener = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [tokens, setTokens] = useState<TokenData[]>(mockTokens);

  const handleSearch = () => {
    // TODO: Implement actual API call
    toast({
      title: "Searching for tokens",
      description: "This feature will be implemented with actual API integration"
    });
  };

  const getStatusColor = (status: TokenData['status']) => {
    switch (status) {
      case 'halal':
        return 'bg-green-500';
      case 'haram':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Halal Token Screener</h1>
          <p className="text-muted-foreground">Check if your cryptocurrency investments are Shariah-compliant</p>
        </header>

        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Search by token name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="grid gap-6">
            {tokens.map((token) => (
              <Card key={token.symbol}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {token.name} ({token.symbol})
                    </CardTitle>
                    <Badge className={`${getStatusColor(token.status)} capitalize`}>
                      {token.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Analysis:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {token.reasons?.map((reason, index) => (
                        <li key={index} className="text-muted-foreground">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HalalScreener;