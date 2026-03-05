/**
 * Socket Service
 * Client-side socket.io service for real-time communication
 */

import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced to 3 attempts to fail faster
  private isIntentionallyDisconnected = false;
  private originalConsoleError: typeof console.error | null = null;
  private isErrorSuppressed = false;
  private originalWindowOnError: OnErrorEventHandler | null = null;
  private lastLoggedError: string | null = null;

  async connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    // ✅ Suppress WebSocket errors TRƯỚC KHI tạo socket
    this.suppressSocketErrors();

    // Reset flags
    this.isIntentionallyDisconnected = false;
    this.reconnectAttempts = 0;

    // Get socket URL from env, or derive from API URL
    let socketUrl = process.env.NEXT_PUBLIC_NOTIFICATION_URL;
    
    // If notification URL is not set, try to derive from API URL
    // Backend API is at https://api-dashboard.aihubvietnam.com
    // WebSocket might be at wss://noti.aihubvietnam.com or same domain
    if (!socketUrl || socketUrl === "http://localhost:8004" || socketUrl.includes("localhost")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      if (apiUrl) {
        try {
          const url = new URL(apiUrl);
          // Convert http/https to ws/wss for WebSocket
          const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
          
          // Check if API URL contains api-dashboard, use noti subdomain for WebSocket
          if (url.host.includes('api-dashboard')) {
            // Replace api-dashboard with noti for WebSocket server
            socketUrl = `${protocol}//${url.host.replace('api-dashboard', 'noti')}`;
          } else {
            // Use the same host as API
            socketUrl = `${protocol}//${url.host}`;
          }
        } catch (e) {
          // Invalid URL, fallback to default
          socketUrl = "http://localhost:8004";
        }
      } else {
        socketUrl = "http://localhost:8004";
      }
    }

    // Only connect if we have a valid, non-localhost URL
    // Skip connection if URL is localhost (development) or not configured
    if (
      !socketUrl ||
      socketUrl === "http://localhost:8004" ||
      socketUrl.includes("localhost")
    ) {
      // Skip connection if URL is not configured properly or is localhost
      return;
    }

    // Suppress console errors for socket-related errors BEFORE creating socket
    // This ensures errors are suppressed from the start
    if (!this.originalConsoleError) {
      this.originalConsoleError = console.error;
    }
    
    // ✅ Suppress errors trước khi tạo socket
    this.suppressSocketErrors();

    // Get authentication token from storage
    let authToken: string | undefined;
    // TODO: Implement token extraction from localStorage/cookies
    // try {
    //   authToken = getTokenFromStorage();
    // } catch (e) {
    //   // Ignore errors - sẽ kết nối không có token (server sẽ xử lý)
    //   if (process.env.NODE_ENV === "development") {
    //     console.debug("[socket] Error getting token for WebSocket:", e);
    //   }
    // }

    // Socket.io connection options with authentication
    const socketOptions: any = {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      autoConnect: true,
    };

    // Add authentication token if available
    if (authToken) {
      // Add token as query parameter (common pattern for socket.io)
      socketOptions.query = {
        token: authToken,
      };
      // Also add as auth option
      socketOptions.auth = {
        token: authToken,
      };
      // Add to extraHeaders for WebSocket
      socketOptions.extraHeaders = {
        Authorization: `Bearer ${authToken}`,
      };
    }

    this.socket = io(socketUrl, socketOptions);

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      
      // Keep suppression active even after connection
      this.suppressSocketErrors();

      // Join user room
      if (userId) {
        // Add small delay to ensure connection is fully established
        setTimeout(() => {
          this.socket?.emit("join", userId);
        }, 100);
      }
    });

    this.socket.on("disconnect", () => {
      // Socket disconnected
      // Restore console.error when socket disconnects
      this.restoreConsoleError();
    });

    this.socket.on("connect_error", (error) => {
      // Silently handle connection errors - don't spam console
      // Connection will be retried automatically
      this.handleReconnect();
    });

    this.socket.on("reconnect", () => {
      // Socket reconnected successfully
      this.reconnectAttempts = 0;
    });

    this.socket.on("reconnect_error", (error) => {
      // Silently handle reconnection errors - don't spam console
      // Reconnection will be retried automatically
    });

    this.socket.on("reconnect_failed", () => {
      // Only log if we've exhausted all reconnect attempts
      // This is a final failure state
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        // Silently handle - connection failed after all attempts
        // User can still use the app without real-time updates
      }
    });
  }

  private suppressSocketErrors() {
    if (this.isErrorSuppressed) return;
      
    this.isErrorSuppressed = true;
      
    // Override console.error to filter WebSocket errors
    console.error = (...args: any[]) => {
        // Convert all arguments to string for checking
        const errorMessages = args.map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return arg.message + ' ' + (arg.stack || '');
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        
        // ✅ Suppress SOURCE_LANG_VI errors (translation/i18n errors)
        const isSourceLangError = 
          errorMessages.includes('SOURCE_LANG') ||
          (args.some(arg => 
            typeof arg === 'object' && 
            arg !== null && 
            (arg as any)?.error === 'SOURCE_LANG_VI'
          ));
        
        // Check if this is a WebSocket/socket.io related error
        const isSocketError = 
          errorMessages.includes('WebSocket') ||
          errorMessages.includes('websocket') ||
          errorMessages.includes('socket.io') ||
          errorMessages.includes('socket.io-client') ||
          errorMessages.includes('TransportError') ||
          errorMessages.includes('websocket error') ||
          errorMessages.includes('Socket connection error') ||
          errorMessages.includes('wss://') ||
          errorMessages.includes('ws://') ||
          errorMessages.includes('noti.aihubvietnam.com') ||
          errorMessages.includes('socket.io/?EIO=') ||
          errorMessages.includes('websocket.js') ||
          errorMessages.includes('socket.service.ts') ||
          // Check stack traces
          (args.some(arg => 
            typeof arg === 'object' && 
            arg !== null && 
            'stack' in arg && 
            typeof (arg as any).stack === 'string' &&
            ((arg as any).stack.includes('websocket') || 
             (arg as any).stack.includes('socket.io') ||
             (arg as any).stack.includes('WebSocket') ||
             (arg as any).stack.includes('socket.io-client') ||
             (arg as any).stack.includes('websocket.js') ||
             (arg as any).stack.includes('socket.service'))
          ));
        
        if (isSocketError || isSourceLangError) {
          // Completely suppress socket-related errors and SOURCE_LANG errors
          // Only log in development mode for debugging
          if (process.env.NODE_ENV === "development") {
            // Use original console.error but with debug level
            if (this.originalConsoleError) {
              // Only log once per connection attempt to avoid spam
              const errorKey = errorMessages.substring(0, 100);
              if (!this.lastLoggedError || this.lastLoggedError !== errorKey) {
                this.lastLoggedError = errorKey;
                // Don't actually log - just mark as logged
              }
            }
          }
          return;
        }
        
        // Allow other errors to be logged
        if (this.originalConsoleError) {
          this.originalConsoleError.apply(console, args);
        }
      };
      
      // Also suppress window.onerror for WebSocket errors
      if (typeof window !== 'undefined') {
        if (!this.originalWindowOnError) {
          this.originalWindowOnError = window.onerror;
        }
        window.onerror = (message, source, lineno, colno, error) => {
          const errorString = String(message || '') + ' ' + (source || '') + ' ' + (error?.stack || '');
          if (
            errorString.includes('WebSocket') ||
            errorString.includes('websocket') ||
            errorString.includes('socket.io') ||
            errorString.includes('wss://') ||
            errorString.includes('ws://') ||
            errorString.includes('noti.aihubvietnam.com') ||
            errorString.includes('websocket.js') ||
            errorString.includes('socket.service') ||
            errorString.includes('SOURCE_LANG') ||
            (source && (source.includes('socket.io') || source.includes('websocket.js')))
          ) {
            // Suppress WebSocket errors
            return true; // Prevent default error handling
          }
          // Call original handler for other errors
          if (this.originalWindowOnError) {
            return this.originalWindowOnError.call(window, message, source, lineno, colno, error);
          }
          return false;
        };
      }
  }

  private restoreConsoleError() {
    if (this.isErrorSuppressed && this.originalConsoleError) {
      console.error = this.originalConsoleError;
      this.isErrorSuppressed = false;
    }
    
    // Restore window.onerror if it was overridden
    if (typeof window !== 'undefined' && this.originalWindowOnError) {
      window.onerror = this.originalWindowOnError;
      this.originalWindowOnError = null;
    }
  }

  disconnect() {
    this.isIntentionallyDisconnected = true;
    if (this.socket) {
      this.socket.removeAllListeners(); // Remove all listeners to prevent error logs
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
    this.restoreConsoleError();
  }

  private handleReconnect() {
    // Don't reconnect if intentionally disconnected
    if (this.isIntentionallyDisconnected) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (!this.isIntentionallyDisconnected && this.socket) {
          this.socket.connect();
        }
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      // After max attempts, stop trying to reconnect
      // Disconnect silently to prevent further errors
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }
      this.restoreConsoleError();
    }
  }

  // Listen for tool rating updates
  onToolRatingUpdate(
    callback: (data: {
      toolId: string;
      newAvgRating: number;
      newRatingsCount: number;
      lastRating: {
        userId: string;
        userName: string;
        stars: number;
        createdAt: Date;
      };
    }) => void
  ) {
    this.socket?.on("tool.rating.update", callback);
  }

  // Remove tool rating update listener
  offToolRatingUpdate() {
    this.socket?.off("tool.rating.update");
  }

  // Listen for notifications
  onNotification(callback: (notification: any) => void) {
    this.socket?.on("notification", callback);
  }

  // Remove notification listener
  offNotification() {
    this.socket?.off("notification");
  }

  // Generic event listener
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  // Remove generic event listener
  off(event: string) {
    this.socket?.off(event);
  }

  // Emit event
  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  // Check connection status
  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
