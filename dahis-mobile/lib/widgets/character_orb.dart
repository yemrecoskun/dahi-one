import 'package:flutter/material.dart';
import '../models/character.dart';

class CharacterOrb extends StatefulWidget {
  final Character character;
  final VoidCallback onTap;

  const CharacterOrb({
    super.key,
    required this.character,
    required this.onTap,
  });

  @override
  State<CharacterOrb> createState() => _CharacterOrbState();
}

class _CharacterOrbState extends State<CharacterOrb>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _parseColor(String colorCode) {
    return Color(int.parse(colorCode.replaceFirst('#', '0xFF')));
  }

  @override
  Widget build(BuildContext context) {
    final color = _parseColor(widget.character.colorCode);
    
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color,
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.5),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(15.0),
                child: Image.asset(
                  widget.character.image,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

