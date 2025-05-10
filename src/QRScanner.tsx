import React, { useState, useEffect } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Alert, AlertDescription } from "./components/ui/alert";
import { ScrollArea } from "./components/ui/scroll-area";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";

interface AttendanceRecord {
  ticketId: string;
  timestamp: string;
  status: string;
}

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
      <Alert
        className={`w-96 ${
          type === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}
      >
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const QRScanner: React.FC = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes.length || loading) return;
    const data = detectedCodes[0].rawValue;
    setNotification({
      message: `Processing Ticket ID: ${data}`,
      type: "success",
    });
    await markAttendance(data);
  };

  const markAttendance = async (ticketID: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxdFIvMwEZuY3rL0hFMI22biQstQNsC4t90S0mM0NNd_zd2_Zhm_2EmA9cmCXMcFehxsA/exec",
        {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({ ticketID }),
          mode: "cors",
        }
      );

      const data = await response.json();
      setNotification({
        message: data.message || "Attendance marked successfully",
        type: data.success ? "success" : "error",
      });

      setAttendanceList((prev) => [
        {
          ticketId: ticketID,
          timestamp: new Date().toLocaleString(),
          status: data.success ? "Attended" : "Failed",
        },
        ...prev,
      ]);
    } catch {
      setNotification({
        message: "Error marking attendance.",
        type: "error",
      });
      setAttendanceList((prev) => [
        {
          ticketId: ticketID,
          timestamp: new Date().toLocaleString(),
          status: "Failed",
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl relative min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Background elements with random positioning */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Random positioned asterisks */}
        <div className="absolute w-32 h-32 bg-[url('/asteric4.png')] bg-contain bg-no-repeat top-[15%] left-[0%] animate-spin-slow"></div>
        <div className="absolute w-28 h-28 bg-[url('/asteric4.png')] bg-contain bg-no-repeat top-[25%] right-[5%] animate-spin-slow"></div>
        <div className="absolute w-40 h-40 bg-[url('/asteric4.png')] bg-contain bg-no-repeat bottom-[20%] left-[2%] animate-spin-slow"></div>
        <div className="absolute w-24 h-24 bg-[url('/asteric4.png')] bg-contain bg-no-repeat top-[0%] right-[2%] animate-spin-slow"></div>
        <div className="absolute w-40 h-40 bg-[url('/asteric4.png')] bg-contain bg-no-repeat bottom-[0%] right-[0%] animate-spin-slow"></div>
        <div className="absolute w-28 h-28 bg-[url('/asteric4.png')] bg-contain bg-no-repeat top-[0%] left-[20%] animate-spin-slow"></div>
        <div className="absolute w-32 h-32 bg-[url('/asteric4.png')] bg-contain bg-no-repeat bottom-[0%] left-[20%] animate-spin-slow"></div>
        <div className="absolute w-36 h-36 bg-[url('/asteric4.png')] bg-contain bg-no-repeat top-[0%] right-[25%] animate-spin-slow"></div>
        <div className="absolute w-24 h-24 bg-[url('/asteric4.png')] bg-contain bg-no-repeat bottom-[1%] right-[30%] animate-spin-slow"></div>

        {/* Center asterisk - slightly lower opacity to be more subtle */}
        <div className="absolute w-40 h-40 bg-[url('/asteric4.png')] bg-contain bg-no-repeat top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow "></div>
      </div>

      <h1 className="text-5xl font-bold mb-8 text-center font-brodish tracking-widest relative z-10">
        QR Attendance Scanner
      </h1>

      <div className="grid lg:grid-cols-2 gap-8 relative z-10">
        <Card className="bg-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <Scanner onScan={handleScan} />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recently Scanned Tickets</CardTitle>
              <Badge variant="secondary">{attendanceList.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px] pr-4">
              <div className="space-y-3">
                {attendanceList.map(
                  ({ ticketId, timestamp, status }, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{ticketId}</div>
                          <div className="text-sm text-muted-foreground">
                            {timestamp}
                          </div>
                        </div>
                        <Badge
                          variant={
                            status === "Attended" ? "default" : "destructive"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                  )
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScanner;
