import React, { useEffect, useRef, useState } from 'react';

/**
 * Modern Meteor Rain - 现代流星雨动画
 * 
 * 特点:
 * - 更自然的流星轨迹
 * - 柔和的光晕效果
 * - 性能优化
 * - 响应式设计
 */
export default function MeteorRain({ 
  enabled = true, 
  meteorCount = 15,
  speed = 1.2,
  palette = ['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)']
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const meteorsRef = useRef([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 流星类
  class Meteor {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.reset();
    }

    reset() {
      // 从屏幕右上方开始
      this.x = Math.random() * this.width + this.width * 0.2;
      this.y = -100 - Math.random() * 200;
      
      // 速度和大小
      this.speed = (2 + Math.random() * 3) * speed;
      this.length = 60 + Math.random() * 80;
      this.size = 1 + Math.random() * 1.5;
      
      // 颜色
      this.color = palette[Math.floor(Math.random() * palette.length)];
      
      // 透明度动画
      this.opacity = 0;
      this.fadeIn = true;
      this.maxOpacity = 0.6 + Math.random() * 0.4;
      
      // 角度（45度向下）
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    }

    update() {
      // 淡入淡出
      if (this.fadeIn) {
        this.opacity += 0.05;
        if (this.opacity >= this.maxOpacity) {
          this.fadeIn = false;
        }
      } else {
        this.opacity -= 0.008;
      }

      // 移动
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      // 重置条件
      if (this.y > this.height + 100 || this.x > this.width + 100 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = this.opacity;

      // 计算尾部位置
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      // 绘制流星尾巴（渐变）
      const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      // 绘制流星头部光晕
      const glowGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 4
      );
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      glowGradient.addColorStop(0.3, this.color);
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // 初始化和窗口大小调整
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 动画循环
  useEffect(() => {
    if (!enabled || !dimensions.width) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // 设置画布尺寸（高DPI支持）
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // 初始化流星
    meteorsRef.current = Array.from(
      { length: meteorCount },
      () => new Meteor(dimensions.width, dimensions.height)
    );

    // 为了更自然的效果，随机分布初始位置
    meteorsRef.current.forEach((meteor, i) => {
      meteor.y = (i / meteorCount) * dimensions.height - 200;
      meteor.x = Math.random() * dimensions.width;
    });

    // 动画函数
    let lastTime = 0;
    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;

      // 限制帧率到60fps
      if (deltaTime < 16) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastTime = currentTime;

      // 清空画布（带轻微拖尾效果）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // 更新和绘制所有流星
      meteorsRef.current.forEach(meteor => {
        meteor.update();
        meteor.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, dimensions, meteorCount, speed, palette]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        width: dimensions.width,
        height: dimensions.height,
        opacity: 0.6
      }}
    />
  );
}