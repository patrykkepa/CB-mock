<script setup>
</script>

<template>
    <div class="h-[calc(100vh-0rem)] flex items-center justify-center">
        <div class="boot-panel">
            <div class="boot-header">
                <i class="pi pi-server boot-icon"></i>
                <div>
                    <div class="boot-title">Initializing Central Battery</div>
                    <div class="boot-subtitle">Loading Console…</div>
                </div>
            </div>

            <div class="boot-progress-wrapper">
                <div class="boot-progress-bar">
                    <div class="boot-progress-fill"></div>
                </div>
                <div class="boot-lights">
                    <span class="boot-light l1"></span>
                    <span class="boot-light l2"></span>
                    <span class="boot-light l3"></span>
                </div>
            </div>

            <div class="boot-footer">
                <span class="boot-footer-label">OFFLINE MOCK MODE</span>
                <span class="boot-footer-text">No live hardware connected</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.boot-panel {
    width: 380px;
    max-width: 90vw;
    padding: 20px 22px;
    border-radius: 14px;

    background: radial-gradient(circle at 0% 0%, #374151 0, #020617 55%);
    border: 1px solid #4b5563;
    box-shadow:
        0 18px 45px rgba(0,0,0,0.7),
        inset 0 0 0 1px rgba(148,163,184,0.25);

    display: flex;
    flex-direction: column;
    gap: 14px;
    color: #e5e7eb;
}

.boot-header {
    display: flex;
    align-items: center;
    gap: 14px;
}

.boot-icon {
    font-size: 28px;
    color: #38bdf8;
    text-shadow: 0 0 12px rgba(56,189,248,0.8);
}

.boot-title {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.03em;
}

.boot-subtitle {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 2px;
}

.boot-progress-wrapper {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.boot-progress-bar {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(15,23,42,0.8);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(30,64,175,0.6);
}

.boot-progress-fill {
    height: 100%;
    width: 45%;
    border-radius: 999px;
    background: linear-gradient(90deg, #22c55e, #4ade80, #22c55e);
    animation: bootProgress 1.4s ease-in-out infinite;
}

.boot-lights {
    display: flex;
    gap: 6px;
}

.boot-light {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #1f2937;
    box-shadow: 0 0 0 1px rgba(15,23,42,0.8);
}

.boot-light.l1 {
    animation: bootLight 1.2s infinite ease-in-out 0s;
}
.boot-light.l2 {
    animation: bootLight 1.2s infinite ease-in-out 0.2s;
}
.boot-light.l3 {
    animation: bootLight 1.2s infinite ease-in-out 0.4s;
}

.boot-footer {
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #9ca3af;
}

.boot-footer-label {
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid rgba(248,250,252,0.2);
    background: rgba(15,23,42,0.9);
    font-size: 10px;
    letter-spacing: 0.08em;
}

.boot-footer-text {
    opacity: 0.8;
}

@keyframes bootProgress {
    0%   { transform: translateX(-60%); }
    50%  { transform: translateX(5%); }
    100% { transform: translateX(110%); }
}

@keyframes bootLight {
    0%, 100% {
        background: #1f2937;
        box-shadow: 0 0 0 1px rgba(15,23,42,0.8);
    }
    50% {
        background: #22c55e;
        box-shadow: 0 0 8px rgba(34,197,94,0.9);
    }
}
</style>
