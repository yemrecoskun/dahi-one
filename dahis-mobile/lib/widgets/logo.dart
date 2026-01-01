import 'package:flutter/material.dart';

class DahisLogo extends StatelessWidget {
  final double fontSize;
  final bool showShadow;
  final bool animated;

  const DahisLogo({
    super.key,
    this.fontSize = 24,
    this.showShadow = true,
    this.animated = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget logo = ShaderMask(
      shaderCallback: (bounds) => const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color(0xFF667eea),
          Color(0xFF764ba2),
          Color(0xFFf093fb),
        ],
        stops: [0.0, 0.5, 1.0],
      ).createShader(bounds),
      child: Text(
        "dahi's",
        style: TextStyle(
          fontWeight: FontWeight.w800,
          fontSize: fontSize,
          color: Colors.white,
          letterSpacing: -0.5,
          height: 1.1,
          shadows: showShadow
              ? [
                  Shadow(
                    color: const Color(0xFF667eea).withValues(alpha: 0.5),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                  Shadow(
                    color: const Color(0xFF764ba2).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
      ),
    );

    if (animated) {
      return TweenAnimationBuilder<double>(
        tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 800),
        curve: Curves.easeOutCubic,
        builder: (context, value, child) {
          return Transform.scale(
            scale: 0.8 + (0.2 * value),
            child: Opacity(
              opacity: value,
              child: logo,
            ),
          );
        },
      );
    }

    return logo;
  }
}

