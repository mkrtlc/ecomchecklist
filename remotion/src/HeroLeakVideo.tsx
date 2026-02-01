import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Visual style guide
const COLORS = {
	bg: '#0F172A',
	text: '#F8FAFC',
	primary: '#3B82F6',
	success: '#22C55E',
	warning: '#F59E0B',
	error: '#EF4444',
};

const easeUi = Easing.bezier(0.4, 0, 0.2, 1);

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const fadeInUp = (frame: number, start: number, duration = 12, dy = 24) => {
	const p = clamp01((frame - start) / duration);
	return {
		opacity: interpolate(p, [0, 1], [0, 1], {easing: easeUi}),
		transform: `translateY(${interpolate(p, [0, 1], [dy, 0], {easing: easeUi})}px)`,
	};
};

const Card: React.FC<{
	x: number;
	y: number;
	w: number;
	h: number;
	borderColor: string;
	bg?: string;
	children: React.ReactNode;
}> = ({x, y, w, h, borderColor, bg = 'rgba(255,255,255,0.04)', children}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				borderRadius: 18,
				background: bg,
				border: `1px solid ${borderColor}`,
				boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
				overflow: 'hidden',
			}}
		>
			{children}
		</div>
	);
};

const MonoNumber: React.FC<{value: string; color?: string; fontSize?: number}> = ({
	value,
	color = COLORS.text,
	fontSize = 42,
}) => (
	<span
		style={{
			fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
			fontWeight: 700,
			letterSpacing: '-0.02em',
			color,
			fontSize,
		}}
	>
		{value}
	</span>
);

const Header: React.FC<{
	title: string;
	subtitle?: string;
	start: number;
	centerX: number;
	maxW: number;
}> = ({title, subtitle, start, centerX, maxW}) => {
	const frame = useCurrentFrame();
	const anim = fadeInUp(frame, start, 14, 28);
	return (
		<div
			style={{
				position: 'absolute',
				left: centerX - maxW / 2,
				top: 92,
				width: maxW,
				...anim,
			}}
		>
			<div
				style={{
					fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
					fontWeight: 800,
					fontSize: 64,
					lineHeight: 1.05,
					color: COLORS.text,
					letterSpacing: '-0.03em',
				}}
			>
				{title}
			</div>
			{subtitle ? (
				<div
					style={{
						marginTop: 14,
						fontFamily:
							'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
						fontWeight: 500,
						fontSize: 22,
						lineHeight: 1.35,
						color: 'rgba(248,250,252,0.78)',
						maxWidth: 920,
					}}
				>
					{subtitle}
				</div>
			) : null}
		</div>
	);
};

const ProgressPill: React.FC<{label: string; percent: number; color: string; start: number; x: number; y: number; w: number;}> = ({
	label,
	percent,
	color,
	start,
	x,
	y,
	w,
}) => {
	const frame = useCurrentFrame();
	const reveal = clamp01((frame - start) / 12);
	const fill = clamp01((frame - start - 6) / 40);
	const shown = Math.round(interpolate(fill, [0, 1], [0, percent], {easing: easeUi}));
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				opacity: interpolate(reveal, [0, 1], [0, 1], {easing: easeUi}),
				transform: `translateY(${interpolate(reveal, [0, 1], [18, 0], {easing: easeUi})}px)`,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 12,
					marginBottom: 10,
					fontFamily:
						'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
					fontSize: 16,
					color: 'rgba(248,250,252,0.82)',
				}}
			>
				<span style={{fontWeight: 600}}>{label}</span>
				<MonoNumber value={`${shown}%`} color={color} fontSize={18} />
			</div>
			<div style={{height: 10, borderRadius: 999, background: 'rgba(248,250,252,0.10)', overflow: 'hidden'}}>
				<div
					style={{
						height: '100%',
						width: `${shown}%`,
						background: color,
						borderRadius: 999,
						transition: 'width 100ms linear',
					}}
				/>
			</div>
		</div>
	);
};

const LeakChip: React.FC<{label: string; color: string; start: number; x: number; y: number;}> = ({label, color, start, x, y}) => {
	const frame = useCurrentFrame();
	const p = clamp01((frame - start) / 12);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				opacity: interpolate(p, [0, 1], [0, 1], {easing: easeUi}),
				transform: `translateY(${interpolate(p, [0, 1], [10, 0], {easing: easeUi})}px)`,
				background: 'rgba(15, 23, 42, 0.55)',
				border: `1px solid rgba(248,250,252,0.10)`,
				backdropFilter: 'blur(10px)',
				padding: '10px 12px',
				borderRadius: 999,
				display: 'inline-flex',
				alignItems: 'center',
				gap: 10,
			}}
		>
			<div style={{width: 10, height: 10, borderRadius: 999, background: color, boxShadow: `0 0 18px ${color}66`}} />
			<div
				style={{
					fontFamily:
						'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
					fontSize: 15,
					fontWeight: 600,
					color: 'rgba(248,250,252,0.86)',
				}}
			>
				{label}
			</div>
		</div>
	);
};

const SceneContainer: React.FC<{children: React.ReactNode}> = ({children}) => {
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(1200px 700px at 20% 25%, rgba(59,130,246,0.16) 0%, rgba(15,23,42,0) 60%), radial-gradient(900px 600px at 85% 85%, rgba(239,68,68,0.12) 0%, rgba(15,23,42,0) 55%), ${COLORS.bg}`,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

/**
 * NOTE:
 * The user-provided brief references a detailed “Scenes 1-8” breakdown that is not present in this repo.
 * This composition implements an 8-scene / 60s structure with placeholder UI that can be tuned to match
 * exact scene copy + SFX once provided.
 */
export const HeroLeakVideo: React.FC<{variant: '16x9' | '1x1'}> = ({variant}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	// 60 seconds @30fps
	const sceneDur = 225; // 7.5s
	const scene = Math.min(7, Math.floor(frame / sceneDur));
	const sceneStart = scene * sceneDur;
	const local = frame - sceneStart;

	const isSquare = variant === '1x1' || width === height;
	const centerX = width / 2;
	const maxW = isSquare ? Math.min(980, width - 120) : Math.min(1280, width - 160);

	const canvas = useMemo(() => {
		const pad = isSquare ? 70 : 90;
		const top = isSquare ? 320 : 280;
		const w = Math.min(isSquare ? 920 : 1120, width - pad * 2);
		const h = isSquare ? 610 : 640;
		return {
			x: centerX - w / 2,
			y: top,
			w,
			h,
			pad,
		};
	}, [centerX, isSquare, width]);

	// subtle film-grain / glow movement
	const bgPulse = 1 + Math.sin(frame * 0.015) * 0.01;

	return (
		<SceneContainer>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: `scale(${bgPulse})`,
					transformOrigin: '50% 50%',
				}}
			/>

			{/* Scene header copy */}
			{scene === 0 ? (
				<Header
					title={'Your e-commerce store\nis leaking money.'}
					subtitle={'Find out exactly where in 60 seconds — and what to fix first.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 1 ? (
				<Header
					title={'Run a 60-second audit'}
					subtitle={'Paste your store URL. We scan conversion leaks, performance, tracking, and UX.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 2 ? (
				<Header
					title={'Leak #1: Checkout drop-off'}
					subtitle={'A small friction point at checkout can cost thousands per month.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 3 ? (
				<Header
					title={'Leak #2: Slow mobile speed'}
					subtitle={'Every extra second increases drop-off — especially on mobile.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 4 ? (
				<Header
					title={'Leak #3: Broken tracking'}
					subtitle={'When events don\'t fire, you can\'t optimize what\'s actually working.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 5 ? (
				<Header
					title={'Leak #4: Missed AOV wins'}
					subtitle={'Upsells and bundles can raise revenue without more ad spend.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 6 ? (
				<Header
					title={'Get a prioritized fix list'}
					subtitle={'Clear next steps — what to fix first for the biggest revenue impact.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 7 ? (
				<Header
					title={'Find out where in 60 seconds.'}
					subtitle={'Run your free e-commerce audit on northwindoutfitters.com'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}

			{/* Main UI canvas (placeholder dashboard) */}
			<Card
				x={canvas.x}
				y={canvas.y}
				w={canvas.w}
				h={canvas.h}
				borderColor={'rgba(248,250,252,0.10)'}
			>
				{/* top bar */}
				<div
					style={{
						height: 62,
						background: 'rgba(248,250,252,0.03)',
						borderBottom: '1px solid rgba(248,250,252,0.08)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 18px',
					}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
						<div style={{width: 10, height: 10, borderRadius: 99, background: COLORS.error, opacity: 0.7}} />
						<div style={{width: 10, height: 10, borderRadius: 99, background: COLORS.warning, opacity: 0.7}} />
						<div style={{width: 10, height: 10, borderRadius: 99, background: COLORS.success, opacity: 0.7}} />
						<div
							style={{
								marginLeft: 8,
								fontFamily:
									'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
								fontWeight: 700,
								fontSize: 14,
								color: 'rgba(248,250,252,0.82)',
							}}
						>
							EcomChecklist Audit
						</div>
					</div>
					<div
						style={{
							fontFamily:
								'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
							fontSize: 13,
							color: 'rgba(248,250,252,0.62)',
						}}
					>
						northwindoutfitters.com
					</div>
				</div>

				{/* content area */}
				<div style={{position: 'relative', height: canvas.h - 62}}>
					{/* Scene 0: big alert */}
					{scene === 0 ? (
						<>
							<LeakChip
								label={'Revenue leak detected'}
								color={COLORS.error}
								start={sceneStart + 18}
								x={32}
								y={28}
							/>
							<div
								style={{
									position: 'absolute',
									left: 32,
									top: 92,
									width: canvas.w - 64,
									height: isSquare ? 260 : 220,
									borderRadius: 16,
									background:
										'linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(59,130,246,0.10) 45%, rgba(15,23,42,0.0) 100%)',
									border: '1px solid rgba(239,68,68,0.28)',
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: 56,
									top: 124,
									fontFamily:
										'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
									fontWeight: 800,
									fontSize: isSquare ? 36 : 40,
									letterSpacing: '-0.03em',
									color: COLORS.text,
									...fadeInUp(frame, sceneStart + 22, 14, 18),
								}}
							>
								Potential loss:
								<span style={{marginLeft: 10}}>
									<MonoNumber value={'$3,420/mo'} color={COLORS.error} fontSize={isSquare ? 40 : 44} />
								</span>
							</div>
							<div
								style={{
									position: 'absolute',
									left: 56,
									top: 182,
									fontFamily:
										'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
									fontWeight: 600,
									fontSize: 18,
									color: 'rgba(248,250,252,0.74)',
									maxWidth: canvas.w - 120,
									...fadeInUp(frame, sceneStart + 30, 14, 16),
								}}
							>
								We\'ll pinpoint the biggest revenue leaks — and give you a fix-first checklist.
							</div>
						</>
					) : null}

					{/* Scene 1: URL + scan */}
					{scene === 1 ? (
						<>
							<div
								style={{
									position: 'absolute',
									left: 32,
									top: 36,
									width: canvas.w - 64,
									borderRadius: 16,
									border: '1px solid rgba(59,130,246,0.30)',
									background: 'rgba(59,130,246,0.08)',
									padding: 18,
									...fadeInUp(frame, sceneStart + 16, 12, 16),
								}}
							>
								<div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
									<div
										style={{
											width: 46,
											height: 46,
											borderRadius: 12,
											background: 'rgba(59,130,246,0.22)',
											display: 'grid',
											placeItems: 'center',
											color: COLORS.primary,
											fontWeight: 800,
											fontFamily:
												'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
										}}
									>
										URL
									</div>
									<div style={{flex: 1}}>
										<div style={{color: 'rgba(248,250,252,0.70)', fontSize: 14, fontFamily: 'Inter, system-ui'}}>
											Store URL
										</div>
										<div style={{marginTop: 4}}>
											<MonoNumber value={'northwindoutfitters.com'} color={COLORS.text} fontSize={26} />
										</div>
									</div>
									<div
										style={{
											padding: '10px 14px',
											borderRadius: 999,
											background: 'rgba(34,197,94,0.16)',
											border: '1px solid rgba(34,197,94,0.35)',
											color: COLORS.success,
											fontFamily: 'Inter, system-ui',
											fontWeight: 700,
											fontSize: 14,
										}}
									>
										Analyze
									</div>
								</div>
							</div>

							<ProgressPill
								label={'Scanning in real-time'}
								percent={92}
								color={COLORS.primary}
								start={sceneStart + 44}
								x={32}
								y={130}
								w={canvas.w - 64}
							/>

							<ProgressPill
								label={'Finding revenue leaks'}
								percent={78}
								color={COLORS.error}
								start={sceneStart + 56}
								x={32}
								y={214}
								w={canvas.w - 64}
							/>

							<ProgressPill
								label={'Generating fix list'}
								percent={64}
								color={COLORS.success}
								start={sceneStart + 68}
								x={32}
								y={298}
								w={canvas.w - 64}
							/>
						</>
					) : null}

					{/* Scene 2: checkout funnel */}
					{scene === 2 ? (
						<>
							<LeakChip label={'High drop-off'} color={COLORS.error} start={sceneStart + 18} x={32} y={28} />
							<div
								style={{
									position: 'absolute',
									left: 32,
									top: 84,
									width: canvas.w - 64,
									height: 420,
									borderRadius: 16,
									border: '1px solid rgba(248,250,252,0.08)',
									background: 'rgba(248,250,252,0.03)',
								}}
							>
								{['Add to cart', 'Checkout', 'Payment', 'Order complete'].map((step, i) => {
									const delay = sceneStart + 28 + i * 4; // 50-100ms stagger
									const p = clamp01((frame - delay) / 12);
									const w = canvas.w - 140;
									const barW = Math.round(w * (1 - i * 0.18));
									const isLeak = i === 1;
									const color = isLeak ? COLORS.error : COLORS.primary;
									return (
										<div key={step} style={{position: 'absolute', left: 28, top: 24 + i * 90, width: '100%'}}>
											<div
												style={{
													fontFamily:
														'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
													fontWeight: 600,
													fontSize: 16,
													color: 'rgba(248,250,252,0.80)',
													opacity: interpolate(p, [0, 1], [0, 1], {easing: easeUi}),
													transform: `translateY(${interpolate(p, [0, 1], [10, 0], {easing: easeUi})}px)`,
												}}
											>
												{step}
											</div>
											<div style={{marginTop: 10, height: 14, borderRadius: 999, background: 'rgba(248,250,252,0.10)', overflow: 'hidden', width: w}}>
												<div
													style={{
														height: '100%',
														width: `${Math.round(interpolate(p, [0, 1], [0, barW], {easing: easeUi}))}px`,
														background: color,
														borderRadius: 999,
														boxShadow: isLeak ? `0 0 22px ${COLORS.error}55` : `0 0 16px ${COLORS.primary}33`,
													}}
												/>
											</div>
											{isLeak ? (
												<div style={{marginTop: 10, color: COLORS.error, fontFamily: 'Inter, system-ui', fontWeight: 700}}>
													Leak: extra fields + hidden shipping costs
												</div>
											) : null}
										</div>
									);
								})}
							</div>
							<div style={{position: 'absolute', left: 32, top: 530}}>
								<MonoNumber value={'-18%'} color={COLORS.error} fontSize={54} />
								<div style={{marginTop: 6, color: 'rgba(248,250,252,0.70)', fontFamily: 'Inter, system-ui', fontSize: 16}}>
									Checkout conversion vs. benchmark
								</div>
							</div>
						</>
					) : null}

					{/* Scene 3: speed */}
					{scene === 3 ? (
						<>
							<LeakChip label={'Mobile speed'} color={COLORS.warning} start={sceneStart + 18} x={32} y={28} />
							<div style={{position: 'absolute', left: 32, top: 92, width: canvas.w - 64, height: 520, borderRadius: 16, border: '1px solid rgba(248,250,252,0.08)', background: 'rgba(248,250,252,0.03)'}}>
								{(() => {
									const reveal = spring({frame: local - 18, fps, config: {damping: 18, stiffness: 90}});
									const ms = Math.round(interpolate(reveal, [0, 1], [0, 2840], {easing: easeUi}));
									const gauge = interpolate(reveal, [0, 1], [0, 0.78], {easing: easeUi});
									return (
										<>
											<div style={{position: 'absolute', left: 28, top: 26, color: 'rgba(248,250,252,0.80)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
												Largest Contentful Paint (LCP)
											</div>
											<div style={{position: 'absolute', left: 28, top: 70}}>
												<MonoNumber value={`${ms}ms`} color={ms > 2500 ? COLORS.error : COLORS.success} fontSize={60} />
											</div>
											<div style={{position: 'absolute', left: 28, top: 148, color: 'rgba(248,250,252,0.65)', fontFamily: 'Inter, system-ui', fontSize: 16}}>
												Target: <span style={{color: COLORS.success, fontWeight: 700}}>≤ 2500ms</span>
											</div>
											<div style={{position: 'absolute', left: 28, top: 220, width: canvas.w - 120, height: 14, borderRadius: 999, background: 'rgba(248,250,252,0.10)', overflow: 'hidden'}}>
												<div style={{height: '100%', width: `${Math.round(gauge * 100)}%`, background: COLORS.warning, borderRadius: 999, boxShadow: `0 0 18px ${COLORS.warning}55`}} />
											</div>
											<div style={{position: 'absolute', left: 28, top: 270, display: 'grid', gap: 10}}>
												{[
													{t: 'Compress hero images', c: COLORS.success},
													{t: 'Defer non-critical scripts', c: COLORS.warning},
													{t: 'Fix layout shift on PDP', c: COLORS.warning},
												].map((it, i) => {
													const st = sceneStart + 44 + i * 3;
													return (
														<div key={it.t} style={{display: 'flex', gap: 10, alignItems: 'center', ...fadeInUp(frame, st, 12, 12)}}>
															<div style={{width: 10, height: 10, borderRadius: 999, background: it.c}} />
															<div style={{color: 'rgba(248,250,252,0.78)', fontFamily: 'Inter, system-ui', fontWeight: 600}}>
																{it.t}
															</div>
														</div>
													);
												})}
											</div>
										</>
									);
								})()}
							</div>
						</>
					) : null}

					{/* Scene 4: tracking */}
					{scene === 4 ? (
						<>
							<LeakChip label={'Tracking'} color={COLORS.error} start={sceneStart + 18} x={32} y={28} />
							<div style={{position: 'absolute', left: 32, top: 92, width: canvas.w - 64, height: 520, borderRadius: 16, border: '1px solid rgba(248,250,252,0.08)', background: 'rgba(248,250,252,0.03)'}}>
								<div style={{position: 'absolute', left: 28, top: 26, color: 'rgba(248,250,252,0.80)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
									Event Health
								</div>
								{[
									{name: 'view_item', ok: true},
									{name: 'add_to_cart', ok: true},
									{name: 'begin_checkout', ok: false},
									{name: 'purchase', ok: false},
								].map((ev, i) => {
									const st = sceneStart + 30 + i * 3;
									const c = ev.ok ? COLORS.success : COLORS.error;
									return (
										<div
											key={ev.name}
											style={{
												position: 'absolute',
												left: 28,
												top: 84 + i * 70,
												width: canvas.w - 120,
												borderRadius: 14,
												border: '1px solid rgba(248,250,252,0.08)',
												background: 'rgba(15,23,42,0.35)',
												padding: '14px 14px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												...fadeInUp(frame, st, 12, 12),
											}}
										>
											<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
												<div style={{width: 10, height: 10, borderRadius: 999, background: c}} />
												<MonoNumber value={ev.name} fontSize={18} color={'rgba(248,250,252,0.92)'} />
											</div>
											<div style={{color: c, fontFamily: 'Inter, system-ui', fontWeight: 800}}>
												{ev.ok ? 'OK' : 'MISSING'}
											</div>
										</div>
									);
								})}

								<div style={{position: 'absolute', left: 28, top: 392, width: canvas.w - 120, borderRadius: 16, padding: 16, border: '1px solid rgba(239,68,68,0.28)', background: 'rgba(239,68,68,0.10)', ...fadeInUp(frame, sceneStart + 52, 12, 14)}}>
									<div style={{color: COLORS.text, fontFamily: 'Inter, system-ui', fontWeight: 800, fontSize: 18}}>
										You\'re flying blind
									</div>
									<div style={{marginTop: 8, color: 'rgba(248,250,252,0.74)', fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 16, lineHeight: 1.35}}>
										Fix events to unlock ROAS improvements and accurate attribution.
									</div>
								</div>
							</div>
						</>
					) : null}

					{/* Scene 5: AOV */}
					{scene === 5 ? (
						<>
							<LeakChip label={'Average order value'} color={COLORS.primary} start={sceneStart + 18} x={32} y={28} />
							<div style={{position: 'absolute', left: 32, top: 92, width: canvas.w - 64, height: 520, borderRadius: 16, border: '1px solid rgba(248,250,252,0.08)', background: 'rgba(248,250,252,0.03)'}}>
								<div style={{position: 'absolute', left: 28, top: 26, color: 'rgba(248,250,252,0.80)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
									Revenue per order
								</div>

								<div style={{position: 'absolute', left: 28, top: 72, display: 'flex', alignItems: 'baseline', gap: 14}}>
									<MonoNumber value={'$42.10'} color={COLORS.text} fontSize={62} />
									<div style={{color: COLORS.success, fontFamily: 'Inter, system-ui', fontWeight: 800, fontSize: 22, ...fadeInUp(frame, sceneStart + 28, 12, 8)}}>
										+12% possible
									</div>
								</div>

								{[
									{t: 'Post-purchase upsell', c: COLORS.success},
									{t: 'Bundles on PDP', c: COLORS.success},
									{t: 'Free shipping threshold', c: COLORS.warning},
								].map((it, i) => (
									<div key={it.t} style={{position: 'absolute', left: 28, top: 188 + i * 76, width: canvas.w - 120, borderRadius: 16, border: '1px solid rgba(248,250,252,0.08)', background: 'rgba(15,23,42,0.35)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...fadeInUp(frame, sceneStart + 36 + i * 3, 12, 12)}}>
										<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
											<div style={{width: 10, height: 10, borderRadius: 999, background: it.c}} />
											<div style={{color: 'rgba(248,250,252,0.82)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>{it.t}</div>
										</div>
										<div style={{color: it.c, fontFamily: 'Inter, system-ui', fontWeight: 900}}>
											Impact
										</div>
									</div>
								))}
							</div>
						</>
					) : null}

					{/* Scene 6: prioritized fix list */}
					{scene === 6 ? (
						<>
							<LeakChip label={'Prioritized fixes'} color={COLORS.success} start={sceneStart + 18} x={32} y={28} />
							<div style={{position: 'absolute', left: 32, top: 92, width: canvas.w - 64, height: 520, borderRadius: 16, border: '1px solid rgba(248,250,252,0.08)', background: 'rgba(248,250,252,0.03)'}}>
								<div style={{position: 'absolute', left: 28, top: 26, color: 'rgba(248,250,252,0.80)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
									Fix-first checklist
								</div>

								{[
									{t: 'Remove 2 checkout fields', c: COLORS.success, m: '+0.8% CVR'},
									{t: 'Compress hero images', c: COLORS.success, m: '-600ms LCP'},
									{t: 'Fix begin_checkout event', c: COLORS.warning, m: 'Accurate ROAS'},
									{t: 'Add bundle offer on PDP', c: COLORS.success, m: '+$4.10 AOV'},
								].map((it, i) => (
									<div key={it.t} style={{position: 'absolute', left: 28, top: 84 + i * 92, width: canvas.w - 120, borderRadius: 16, border: '1px solid rgba(248,250,252,0.08)', background: 'rgba(15,23,42,0.35)', padding: '16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...fadeInUp(frame, sceneStart + 26 + i * 3, 12, 12)}}>
										<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
											<div style={{width: 18, height: 18, borderRadius: 6, background: 'rgba(34,197,94,0.15)', border: `1px solid rgba(34,197,94,0.35)`, display: 'grid', placeItems: 'center'}}>
												<div style={{width: 9, height: 9, borderRadius: 2, background: it.c}} />
											</div>
											<div>
												<div style={{color: 'rgba(248,250,252,0.86)', fontFamily: 'Inter, system-ui', fontWeight: 800, fontSize: 16}}>{it.t}</div>
												<div style={{marginTop: 6, color: 'rgba(248,250,252,0.62)', fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 14}}>{it.m}</div>
											</div>
										</div>
										<div style={{color: it.c, fontFamily: 'Inter, system-ui', fontWeight: 900, fontSize: 14}}>
											Priority {i + 1}
										</div>
									</div>
								))}
							</div>
						</>
					) : null}

					{/* Scene 7: CTA */}
					{scene === 7 ? (
						<>
							<div style={{position: 'absolute', left: 32, top: 92, width: canvas.w - 64, height: 520, borderRadius: 18, border: '1px solid rgba(59,130,246,0.35)', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(15,23,42,0.25) 55%, rgba(34,197,94,0.10) 100%)'}} />
							<div style={{position: 'absolute', left: 56, top: 132, ...fadeInUp(frame, sceneStart + 14, 14, 18)}}>
								<div style={{fontFamily: 'Inter, system-ui', fontWeight: 900, fontSize: isSquare ? 34 : 40, color: COLORS.text, letterSpacing: '-0.03em'}}>
									Your e-commerce store is leaking money.
								</div>
								<div style={{marginTop: 14, fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 18, color: 'rgba(248,250,252,0.78)', maxWidth: canvas.w - 140}}>
									Find out where in 60 seconds.
								</div>
							</div>

							<div style={{position: 'absolute', left: 56, top: 260, width: canvas.w - 140, borderRadius: 16, border: '1px solid rgba(248,250,252,0.10)', background: 'rgba(15,23,42,0.35)', padding: 16, ...fadeInUp(frame, sceneStart + 28, 14, 14)}}>
								<div style={{color: 'rgba(248,250,252,0.70)', fontFamily: 'Inter, system-ui', fontSize: 14, fontWeight: 700}}>
									Store URL
								</div>
								<div style={{marginTop: 6}}>
									<MonoNumber value={'northwindoutfitters.com'} color={COLORS.text} fontSize={28} />
								</div>
							</div>

							<div style={{position: 'absolute', left: 56, top: 370, display: 'flex', gap: 14, alignItems: 'center', ...fadeInUp(frame, sceneStart + 38, 14, 12)}}>
								<div style={{padding: '14px 18px', borderRadius: 14, background: COLORS.primary, color: '#fff', fontFamily: 'Inter, system-ui', fontWeight: 900}}>
									Run free audit
								</div>
								<div style={{padding: '14px 18px', borderRadius: 14, background: 'rgba(248,250,252,0.06)', border: '1px solid rgba(248,250,252,0.12)', color: 'rgba(248,250,252,0.86)', fontFamily: 'Inter, system-ui', fontWeight: 800}}>
									No signup required
								</div>
							</div>
						</>
					) : null}
				</div>
			</Card>

			{/* A tiny scene-timer indicator (hidden on square to reduce clutter) */}
			{!isSquare ? (
				<div style={{position: 'absolute', right: 70, bottom: 62, color: 'rgba(248,250,252,0.45)', fontFamily: 'JetBrains Mono, monospace', fontSize: 14}}>
					{String(scene + 1).padStart(2, '0')}/08 • {Math.floor(frame / fps)}s
				</div>
			) : null}
		</SceneContainer>
	);
};
