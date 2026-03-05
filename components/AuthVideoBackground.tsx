"use client";

import React, { useState, useRef, useEffect } from "react";

interface AuthVideoBackgroundProps {
  children: React.ReactNode;
}

function AuthVideoBackground({ children }: Readonly<AuthVideoBackgroundProps>) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Build absolute URL to avoid locale prefix like /en/bg-auth.mp4
    if (typeof window !== 'undefined') {
      const url = new URL('/bg-auth.mp4', window.location.origin);
      setVideoSrc(url.toString());
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= video.duration - 0.2) {
        video.currentTime = 0;
        video.play().catch(() => {
          console.log('Video play failed, retrying...');
        });
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {
        console.log('Video replay failed');
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [mounted, videoLoaded]);

  return (
    <div className="relative min-h-screen w-full bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute top-32 right-20 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-10 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-20 left-1/3 w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(0,180,255,0.15),transparent_40%)] animate-pulse"></div>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[50px_50px]"></div>
      </div>

      {/* Video Background */}
      {mounted && !videoError && videoSrc && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          className={`fixed top-0 left-0 w-full h-full object-cover z-10 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-700`}
          style={{
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
          }}
          onLoadedData={() => {
            setVideoLoaded(true);
            const v = videoRef.current;
            v?.play().catch(() => {});
          }}
          onCanPlayThrough={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* If video truly errors, keep subtle image background */}
      {videoError && (
        <div
          className="fixed top-0 left-0 w-full h-full z-5 bg-center bg-cover"
          style={{ backgroundImage: 'none' }}
        />
      )}

      <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-20" />
      
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(1200px_circle_at_center,rgba(0,180,255,0.15),transparent_65%)] z-30" />

      <div className="fixed top-6 left-6 z-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon/logo.svg" alt="AI Hub" className="h-8 w-auto" />
      </div>
      <div className="relative z-40 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}

export default React.memo(AuthVideoBackground);

