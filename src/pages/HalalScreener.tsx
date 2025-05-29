import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { searchTokens } from '@/services/tokenService';
import { Skeleton } from '@/components/ui/skeleton';

interface TokenData {
  name: string;
  symbol: string;
  status: 'halal' | 'haram' | 'pending';
  reasons: string[];
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
}

const HalalScreener = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const data = await searchTokens('');
      setTokens(data);
    } catch (error) {
      toast({
        title: "Error loading tokens",
        description: "Failed to load token data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchTokens(searchTerm);
      setTokens(results);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search tokens. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
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
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="grid gap-6">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : tokens.map((token) => (
              <Card key={token.symbol} className="hover:bg-secondary/5 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-xl">
                        {token.name} ({token.symbol})
                      </CardTitle>
                      <Badge className={`${getStatusColor(token.status)} capitalize`}>
                        {token.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatNumber(token.price)}</p>
                        <div className={`flex items-center ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.priceChange24h >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span>{Math.abs(token.priceChange24h).toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="font-medium">{formatNumber(token.marketCap)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="font-medium">{formatNumber(token.volume24h)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Shariah Analysis:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {token.reasons.map((reason, index) => (
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