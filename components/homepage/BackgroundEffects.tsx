export default function BackgroundEffects() {
    return (
        <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20 blur-3xl bg-linear-to-br from-light-green"></div>
            <div className="absolute right-20 bottom-20 w-80 h-80 rounded-full blur-3xl bg-linear-to-br from-primary-cyan to-light-green opacity-15"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl transform -translate-x-1/2 -translate-y-1/2 bg-linear-to-br from-primary-cyan"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(159,243,223,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(159,243,223,0.03)_1px,transparent_1px)] bg-size-[50px_50px]"></div>
        </div>
    );
}

