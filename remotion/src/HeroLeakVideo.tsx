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

	// 60 seconds @30fps — scene timings from HERO_VIDEO_BRIEF.md (8s, 7s, 5s, 8s, 10s, 10s, 5s, 7s)
	const SCENE_END_FRAMES = [240, 450, 600, 840, 1140, 1440, 1590, 1800];
	const scene = (() => {
		const i = SCENE_END_FRAMES.findIndex((end) => frame < end);
		return i === -1 ? 7 : i;
	})();
	const sceneStart = scene === 0 ? 0 : SCENE_END_FRAMES[scene - 1];
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

			{/* Scene header copy — from HERO_VIDEO_BRIEF.md */}
			{scene === 0 ? (
				<Header
					title={'Your store has problems.'}
					subtitle={'You just don\'t know where.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 1 ? (
				<Header
					title={'10 different tools.'}
					subtitle={'Hours of work. Hundreds of dollars.'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 2 ? (
				<Header
					title={'Or... one link. 60 seconds. Free.'}
					subtitle={undefined}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 3 ? (
				<Header
					title={'Just paste your URL'}
					subtitle={undefined}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 4 ? (
				<Header
					title={'100 critical checkpoints'}
					subtitle={'Analyzed in real-time'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 5 ? (
				<Header
					title={'Instant insights'}
					subtitle={'Actionable fixes'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 6 ? (
				<Header
					title={'Share with your team'}
					subtitle={'Or your agency'}
					start={sceneStart + 0}
					centerX={centerX}
					maxW={maxW}
				/>
			) : null}
			{scene === 7 ? (
				<Header
					title={'Find your store\'s hidden problems'}
					subtitle={'Free. No signup. Instant results.'}
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
					{/* Scene 0: The Problem — conversion going down, red warnings */}
					{scene === 0 ? (
						<>
							<LeakChip
								label={'Conversion dropping'}
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
								Conversion rate:
								<span style={{marginLeft: 10}}>
									<MonoNumber
										value={`${Number(interpolate(local, [0, 90, 150, 240], [2.3, 1.8, 1.2, 1.2], {easing: easeUi})).toFixed(1)}%`}
										color={COLORS.error}
										fontSize={isSquare ? 40 : 44}
									/>
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
								Red warning icons — your store has problems you can\'t see.
							</div>
						</>
					) : null}

					{/* Scene 1: The Struggle — 10 tools, hours, hundreds of dollars */}
					{scene === 1 ? (
						<>
							{[
								{label: 'PageSpeed', price: '$99/mo', start: sceneStart + 20},
								{label: 'GTmetrix', price: '$199/mo', start: sceneStart + 35},
								{label: 'Ahrefs', price: '$49/mo', start: sceneStart + 50},
							].map((tool, i) => (
								<div
									key={tool.label}
									style={{
										position: 'absolute',
										left: 32 + (i % 2) * ((canvas.w - 120) / 2),
										top: 80 + Math.floor(i / 2) * 140,
										width: (canvas.w - 120) / 2 - 16,
										borderRadius: 16,
										border: '1px solid rgba(248,250,252,0.12)',
										background: 'rgba(248,250,252,0.04)',
										padding: 18,
										...fadeInUp(frame, tool.start, 12, 16),
									}}
								>
									<div style={{color: 'rgba(248,250,252,0.6)', fontFamily: 'Inter, system-ui', fontSize: 14}}>
										{tool.label}
									</div>
									<MonoNumber value={tool.price} color={COLORS.warning} fontSize={28} />
								</div>
							))}
							<div
								style={{
									position: 'absolute',
									left: 32,
									top: isSquare ? 380 : 340,
									fontFamily: 'Inter, system-ui',
									fontWeight: 700,
									fontSize: 18,
									color: 'rgba(248,250,252,0.8)',
									...fadeInUp(frame, sceneStart + 80, 14, 12),
								}}
							>
								10 different tools. Hours of work. Hundreds of dollars.
							</div>
						</>
					) : null}

					{/* Scene 2: Solution intro — Or... one link. 60 seconds. Free. */}
					{scene === 2 ? (
						<>
							<div
								style={{
									position: 'absolute',
									left: 32,
									top: isSquare ? 180 : 160,
									width: canvas.w - 64,
									textAlign: 'center',
									...fadeInUp(frame, sceneStart + 20, 18, 24),
								}}
							>
								<div
									style={{
										fontFamily: 'Inter, ui-sans-serif, system-ui',
										fontWeight: 800,
										fontSize: isSquare ? 28 : 36,
										color: COLORS.primary,
										letterSpacing: '-0.02em',
										marginBottom: 12,
									}}
								>
									EcomChecklist
								</div>
								<div
									style={{
										fontFamily: 'Inter, ui-sans-serif, system-ui',
										fontWeight: 600,
										fontSize: isSquare ? 18 : 22,
										color: 'rgba(248,250,252,0.85)',
									}}
								>
									Or... one link. 60 seconds. Free.
								</div>
							</div>
						</>
					) : null}

					{/* Scene 3: Demo input — Just paste your URL */}
					{scene === 3 ? (
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
											fontFamily: 'Inter, ui-sans-serif, system-ui',
										}}
									>
										URL
									</div>
									<div style={{flex: 1}}>
										<div style={{color: 'rgba(248,250,252,0.70)', fontSize: 14, fontFamily: 'Inter, system-ui'}}>
											Store URL
										</div>
										<div style={{marginTop: 4}}>
											<MonoNumber value={'mystore.com'} color={COLORS.text} fontSize={26} />
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
							<div
								style={{
									position: 'absolute',
									left: 32,
									top: 130,
									color: 'rgba(248,250,252,0.6)',
									fontFamily: 'Inter, system-ui',
									fontSize: 14,
									...fadeInUp(frame, sceneStart + 60, 12, 8),
								}}
							>
								Just paste your URL — loading starts in one click.
							</div>
							<ProgressPill
								label={'Scanning...'}
								percent={100}
								color={COLORS.primary}
								start={sceneStart + 80}
								x={32}
								y={200}
								w={canvas.w - 64}
							/>
						</>
					) : null}

					{/* Scene 4: Demo analysis — 100 critical checkpoints, analyzed in real-time */}
					{scene === 4 ? (
						<>
							<div style={{position: 'absolute', left: 28, top: 26, color: 'rgba(248,250,252,0.80)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
								100 critical checkpoints — analyzed in real-time
							</div>
							{[
								{label: 'SEO', count: 20, start: sceneStart + 20},
								{label: 'Performance', count: 15, start: sceneStart + 40},
								{label: 'Security', count: 15, start: sceneStart + 60},
								{label: 'Conversion', count: 20, start: sceneStart + 80},
								{label: 'Mobile', count: 10, start: sceneStart + 100},
							].map((cat, i) => (
								<div
									key={cat.label}
									style={{
										position: 'absolute',
										left: 28,
										top: 84 + i * 72,
										width: canvas.w - 120,
										borderRadius: 14,
										border: '1px solid rgba(248,250,252,0.08)',
										background: 'rgba(15,23,42,0.35)',
										padding: '14px 18px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										...fadeInUp(frame, cat.start, 12, 12),
									}}
								>
									<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
										<div style={{width: 10, height: 10, borderRadius: 999, background: COLORS.success}} />
										<span style={{color: 'rgba(248,250,252,0.92)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
											{cat.label}
										</span>
									</div>
									<MonoNumber value={`${cat.count} checks`} color={COLORS.primary} fontSize={16} />
								</div>
							))}
							<div
								style={{
									position: 'absolute',
									left: 28,
									top: 460,
									fontFamily: 'JetBrains Mono, monospace',
									fontSize: 18,
									color: 'rgba(248,250,252,0.7)',
									...fadeInUp(frame, sceneStart + 140, 14, 8),
								}}
							>
								{Math.min(100, Math.round(20 + (local / 300) * 80))}/100 checks complete...
							</div>
						</>
					) : null}

					{/* Scene 5: Demo results — Instant insights, Actionable fixes, score 67 */}
					{scene === 5 ? (
						<>
							<div style={{position: 'absolute', left: 28, top: 26, color: 'rgba(248,250,252,0.80)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
								Instant insights — actionable fixes
							</div>
							<div
								style={{
									position: 'absolute',
									right: 28,
									top: 60,
									...fadeInUp(frame, sceneStart + 20, 14, 12),
								}}
							>
								<MonoNumber
									value={String(Math.min(67, Math.round(interpolate(local, [0, 90], [0, 67], {easing: easeUi}))))}
									color={COLORS.warning}
									fontSize={56}
								/>
								<div style={{fontSize: 14, color: 'rgba(248,250,252,0.6)', fontFamily: 'Inter, system-ui'}}>/100</div>
							</div>
							{[
								{label: 'SEO', score: '14/20', status: 'warning', start: sceneStart + 30},
								{label: 'Performance', score: '8/15', status: 'error', start: sceneStart + 50},
								{label: 'Security', score: '13/15', status: 'success', start: sceneStart + 70},
								{label: 'Conversion', score: '12/20', status: 'warning', start: sceneStart + 90},
							].map((row, i) => {
								const c = row.status === 'success' ? COLORS.success : row.status === 'warning' ? COLORS.warning : COLORS.error;
								return (
									<div
										key={row.label}
										style={{
											position: 'absolute',
											left: 28,
											top: 140 + i * 72,
											width: canvas.w - 120,
											borderRadius: 14,
											border: '1px solid rgba(248,250,252,0.08)',
											background: 'rgba(15,23,42,0.35)',
											padding: '12px 18px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											...fadeInUp(frame, row.start, 12, 12),
										}}
									>
										<span style={{color: 'rgba(248,250,252,0.88)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
											{row.label}
										</span>
										<MonoNumber value={row.score} color={c} fontSize={18} />
									</div>
								);
							})}
						</>
					) : null}

					{/* Scene 6: PDF report tease — Share with your team / Or your agency */}
					{scene === 6 ? (
						<>
							<div style={{position: 'absolute', left: 28, top: 26, color: 'rgba(248,250,252,0.80)', fontFamily: 'Inter, system-ui', fontWeight: 700, fontSize: 16}}>
								Share with your team — or your agency
							</div>
							{[
								{title: 'Executive Summary', start: sceneStart + 20},
								{title: 'Detailed findings', start: sceneStart + 45},
								{title: 'Priority fix list', start: sceneStart + 70},
							].map((page, i) => (
								<div
									key={page.title}
									style={{
										position: 'absolute',
										left: 28,
										top: 84 + i * 100,
										width: canvas.w - 120,
										borderRadius: 14,
										border: '1px solid rgba(248,250,252,0.10)',
										background: 'rgba(248,250,252,0.04)',
										padding: '18px 20px',
										display: 'flex',
										alignItems: 'center',
										gap: 14,
										...fadeInUp(frame, page.start, 14, 12),
									}}
								>
									<div
										style={{
											width: 40,
											height: 52,
											borderRadius: 4,
											background: 'rgba(239,68,68,0.15)',
											border: '1px solid rgba(248,250,252,0.12)',
										}}
									/>
									<div>
										<div style={{color: 'rgba(248,250,252,0.92)', fontFamily: 'Inter, system-ui', fontWeight: 800, fontSize: 16}}>
											{page.title}
										</div>
										<div style={{marginTop: 4, color: 'rgba(248,250,252,0.6)', fontFamily: 'Inter, system-ui', fontSize: 14}}>
											PDF Report • EcomChecklist
										</div>
									</div>
								</div>
							))}
						</>
					) : null}

					{/* Scene 7: CTA — Find your store's hidden problems / Free. No signup. Instant results. */}
					{scene === 7 ? (
						<>
							<div style={{position: 'absolute', left: 32, top: 92, width: canvas.w - 64, height: 520, borderRadius: 18, border: '1px solid rgba(59,130,246,0.35)', background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(15,23,42,0.25) 55%, rgba(34,197,94,0.10) 100%)'}} />
							<div style={{position: 'absolute', left: 56, top: 132, ...fadeInUp(frame, sceneStart + 14, 14, 18)}}>
								<div style={{fontFamily: 'Inter, system-ui', fontWeight: 900, fontSize: isSquare ? 34 : 40, color: COLORS.text, letterSpacing: '-0.03em'}}>
									Find your store\'s hidden problems
								</div>
								<div style={{marginTop: 14, fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 18, color: 'rgba(248,250,252,0.78)', maxWidth: canvas.w - 140}}>
									Free. No signup. Instant results.
								</div>
							</div>

							<div style={{position: 'absolute', left: 56, top: 260, width: canvas.w - 140, borderRadius: 16, border: '1px solid rgba(248,250,252,0.10)', background: 'rgba(15,23,42,0.35)', padding: 16, ...fadeInUp(frame, sceneStart + 28, 14, 14)}}>
								<div style={{color: 'rgba(248,250,252,0.70)', fontFamily: 'Inter, system-ui', fontSize: 14, fontWeight: 700}}>
									Enter your store URL...
								</div>
								<div style={{marginTop: 6}}>
									<MonoNumber value={'northwindoutfitters.com'} color={COLORS.text} fontSize={28} />
								</div>
							</div>

							<div style={{position: 'absolute', left: 56, top: 370, display: 'flex', gap: 14, alignItems: 'center', ...fadeInUp(frame, sceneStart + 38, 14, 12)}}>
								<div style={{padding: '14px 18px', borderRadius: 14, background: COLORS.primary, color: '#fff', fontFamily: 'Inter, system-ui', fontWeight: 900}}>
									Analyze Free
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
