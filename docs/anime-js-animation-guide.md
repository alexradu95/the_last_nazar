# Life OS - Anime.js Animation Guide

---

## 🎬 Animation System Overview

This guide provides comprehensive animation patterns using Anime.js for creating delightful, performant, and meaningful animations throughout the Life OS application.

---

## 🚀 Core Animation Principles

### Performance Guidelines
```javascript
// Always use transforms over position properties
// ❌ Bad - causes reflow
anime({
  targets: '.element',
  left: '100px',
  top: '50px'
});

// ✅ Good - GPU accelerated
anime({
  targets: '.element',
  translateX: 100,
  translateY: 50
});

// Batch animations with timeline
const timeline = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
});

// Use will-change CSS property for critical animations
.critical-element {
  will-change: transform, opacity;
}
```

### Animation Timing Functions
```javascript
const timingPresets = {
  // Entrances
  bounceIn: 'easeOutElastic(1, 0.5)',
  smoothIn: 'easeOutQuad',
  snapIn: 'easeOutExpo',
  
  // Exits
  fadeOut: 'easeInQuad',
  bounceOut: 'easeInBack',
  
  // Interactions
  buttonPress: 'easeInOutQuad',
  springAction: 'spring(1, 80, 10, 0)',
  
  // Continuous
  breathing: 'easeInOutSine',
  floating: 'linear'
};
```

---

## ✨ Entrance Animations

### Agent Entrance Effects
```javascript
// Dawn's Sunrise Entrance
export const dawnEntrance = () => {
  const timeline = anime.timeline({
    easing: 'easeOutExpo',
  });
  
  // Sun rising effect
  timeline
    .add({
      targets: '.dawn-sun',
      translateY: [100, 0],
      scale: [0.5, 1],
      opacity: [0, 1],
      duration: 1200,
      easing: 'easeOutElastic(1, 0.5)'
    })
    // Rays expanding
    .add({
      targets: '.sun-rays',
      scale: [0, 1],
      rotate: [0, 360],
      opacity: [0, 0.6],
      duration: 1500,
      offset: '-=800'
    })
    // Agent sprite appearance
    .add({
      targets: '.dawn-sprite',
      scale: [0, 1],
      rotate: '1turn',
      duration: 600,
      offset: '-=400'
    })
    // Welcome text
    .add({
      targets: '.welcome-text span',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(50)
    });
    
  return timeline;
};

// Atlas Crystal Materialization
export const atlasEntrance = () => {
  return anime({
    targets: '.atlas-crystal',
    keyframes: [
      { scale: 0, rotate: 0, opacity: 0 },
      { scale: 1.2, rotate: 180, opacity: 0.5 },
      { scale: 0.9, rotate: 270, opacity: 0.8 },
      { scale: 1, rotate: 360, opacity: 1 }
    ],
    duration: 800,
    easing: 'easeOutQuad',
    begin: () => {
      // Spawn digital particles
      createDigitalParticles('.atlas-container');
    }
  });
};

// Luna Moonlight Fade
export const lunaEntrance = () => {
  const timeline = anime.timeline({
    easing: 'easeOutSine',
  });
  
  timeline
    // Moonlight glow
    .add({
      targets: '.luna-glow',
      scale: [0, 2],
      opacity: [0, 0.3],
      duration: 1500
    })
    // Spirit appearance
    .add({
      targets: '.luna-spirit',
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 1200,
      offset: '-=1000'
    })
    // Stardust effect
    .add({
      targets: '.stardust',
      translateY: () => anime.random(-50, 50),
      translateX: () => anime.random(-50, 50),
      scale: [0, 1],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(30),
      offset: '-=600'
    });
    
  return timeline;
};
```

### Page Load Animations
```javascript
// Productivity House Entrance
export const productivityHouseLoad = () => {
  const timeline = anime.timeline({
    easing: 'easeOutExpo'
  });
  
  timeline
    // House structure
    .add({
      targets: '.house-structure',
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 1000
    })
    // Rooms appearing
    .add({
      targets: '.room',
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100, {
        grid: [3, 2],
        from: 'center'
      }),
      offset: '-=500'
    })
    // Room labels
    .add({
      targets: '.room-label',
      translateY: [10, 0],
      opacity: [0, 1],
      duration: 400,
      delay: anime.stagger(50),
      offset: '-=300'
    });
    
  return timeline;
};
```

---

## 🎮 Interaction Animations

### Button & Click Effects
```javascript
// Satisfying button press
export const buttonPress = (element) => {
  return anime({
    targets: element,
    scale: [1, 0.95, 1.05, 1],
    duration: 300,
    easing: 'easeInOutQuad'
  });
};

// Task checkbox completion
export const checkboxComplete = (element) => {
  const timeline = anime.timeline({
    easing: 'easeOutExpo'
  });
  
  timeline
    // Checkbox fill
    .add({
      targets: element.querySelector('.checkbox-fill'),
      scale: [0, 1],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutBack'
    })
    // Checkmark draw
    .add({
      targets: element.querySelector('.checkmark-path'),
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 400,
      easing: 'easeInOutSine',
      offset: '-=150'
    })
    // Ripple effect
    .add({
      targets: element.querySelector('.ripple'),
      scale: [0, 2],
      opacity: [1, 0],
      duration: 600,
      offset: '-=300'
    });
    
  return timeline;
};

// Card hover effect
export const cardHover = {
  mouseenter: (element) => {
    anime({
      targets: element,
      scale: 1.05,
      translateY: -5,
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      duration: 300,
      easing: 'easeOutQuad'
    });
  },
  mouseleave: (element) => {
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      duration: 300,
      easing: 'easeOutQuad'
    });
  }
};
```

### Drag and Drop Animations
```javascript
// Task dragging
export const taskDrag = {
  start: (element) => {
    anime({
      targets: element,
      scale: 1.1,
      opacity: 0.8,
      rotate: '2deg',
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  end: (element) => {
    anime({
      targets: element,
      scale: 1,
      opacity: 1,
      rotate: '0deg',
      duration: 300,
      easing: 'easeOutElastic(1, 0.5)'
    });
  },
  
  drop: (element, targetZone) => {
    const timeline = anime.timeline();
    
    timeline
      .add({
        targets: element,
        translateX: targetZone.x - element.x,
        translateY: targetZone.y - element.y,
        duration: 400,
        easing: 'easeInOutQuad'
      })
      .add({
        targets: element,
        scale: [1.1, 1],
        duration: 300,
        easing: 'easeOutBounce'
      });
      
    return timeline;
  }
};
```

---

## 🎉 Celebration & Reward Animations

### XP Gain Effects
```javascript
// XP Counter Animation
export const xpCounter = (element, fromValue, toValue, duration = 1500) => {
  // Counter animation
  anime({
    targets: { value: fromValue },
    value: toValue,
    duration: duration,
    easing: 'easeInOutQuad',
    round: 1,
    update: function(anim) {
      const current = Math.floor(anim.animations[0].currentValue);
      element.innerHTML = `${current} XP`;
      
      // Trigger milestone effects
      if (current % 100 === 0 && current !== fromValue) {
        xpMilestoneFlash(element);
      }
    },
    complete: () => {
      // Final celebration
      if (toValue - fromValue > 100) {
        bigXPCelebration(element);
      }
    }
  });
  
  // Floating XP numbers
  createFloatingNumbers(element, `+${toValue - fromValue}`);
};

// Floating numbers effect
const createFloatingNumbers = (origin, text) => {
  const floater = document.createElement('div');
  floater.className = 'xp-floater';
  floater.textContent = text;
  origin.appendChild(floater);
  
  anime({
    targets: floater,
    translateY: -100,
    opacity: [1, 0],
    scale: [1, 1.5],
    duration: 1500,
    easing: 'easeOutQuad',
    complete: () => floater.remove()
  });
};
```

### Achievement Unlocked
```javascript
export const achievementUnlocked = (achievement) => {
  const timeline = anime.timeline({
    easing: 'easeOutExpo'
  });
  
  // Create achievement notification
  const notification = createAchievementElement(achievement);
  
  timeline
    // Slide in from right
    .add({
      targets: notification,
      translateX: [300, 0],
      opacity: [0, 1],
      duration: 500
    })
    // Badge shine effect
    .add({
      targets: '.achievement-badge',
      rotate: '1turn',
      scale: [0, 1],
      duration: 600,
      offset: '-=300'
    })
    // Sparkle burst
    .add({
      targets: '.achievement-sparkles',
      scale: [0, 1],
      opacity: [1, 0],
      duration: 1000,
      offset: '-=400'
    })
    // Text reveal
    .add({
      targets: '.achievement-text',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
      offset: '-=600'
    })
    // Hold for reading
    .add({
      duration: 2000
    })
    // Slide out
    .add({
      targets: notification,
      translateX: [0, 300],
      opacity: [1, 0],
      duration: 500,
      complete: () => notification.remove()
    });
    
  return timeline;
};
```

### Streak Celebrations
```javascript
export const streakCelebration = (streakCount) => {
  const intensity = Math.min(streakCount / 30, 1); // Max intensity at 30 days
  
  const timeline = anime.timeline();
  
  // Fire effect intensity based on streak
  timeline
    .add({
      targets: '.streak-fire',
      scale: [1, 1 + intensity * 0.5],
      opacity: [0.5, 0.5 + intensity * 0.5],
      duration: 1000,
      easing: 'easeOutElastic(1, 0.5)'
    })
    .add({
      targets: '.streak-number',
      scale: [1, 1.5, 1],
      color: ['#ff6b35', '#ffd700', '#ff6b35'],
      duration: 800,
      offset: '-=500'
    });
    
  // Add particles based on milestones
  if (streakCount % 7 === 0) {
    timeline.add({
      targets: createFireworks('.streak-container', 10),
      translateY: () => anime.random(-200, -100),
      translateX: () => anime.random(-100, 100),
      scale: [0, 1, 0],
      opacity: [1, 1, 0],
      duration: 2000,
      delay: anime.stagger(50),
      offset: '-=500'
    });
  }
  
  return timeline;
};
```

---

## 📝 Text & Content Animations

### Typing Effects
```javascript
// Character by character reveal
export const typeWriter = (element, text, speed = 50) => {
  element.innerHTML = '';
  const chars = text.split('');
  
  chars.forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.opacity = '0';
    element.appendChild(span);
  });
  
  return anime({
    targets: element.querySelectorAll('span'),
    opacity: [0, 1],
    duration: speed,
    delay: anime.stagger(speed),
    easing: 'linear',
    complete: () => {
      // Add cursor blink
      addCursorBlink(element);
    }
  });
};

// Word by word reveal
export const wordReveal = (element) => {
  const words = element.textContent.split(' ');
  element.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
  
  return anime({
    targets: element.querySelectorAll('.word'),
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 400,
    delay: anime.stagger(100),
    easing: 'easeOutQuad'
  });
};
```

### Journal Writing Effects
```javascript
// Fire text effect for journaling
export const fireTextEffect = (element) => {
  const timeline = anime.timeline();
  
  // Create fire particles for each character
  element.addEventListener('input', (e) => {
    const lastChar = e.data;
    if (lastChar) {
      createFireParticle(element, lastChar);
    }
  });
  
  return timeline;
};

const createFireParticle = (origin, char) => {
  const particle = document.createElement('span');
  particle.className = 'fire-particle';
  particle.textContent = char;
  
  const rect = origin.getBoundingClientRect();
  particle.style.position = 'fixed';
  particle.style.left = `${rect.right}px`;
  particle.style.top = `${rect.top}px`;
  document.body.appendChild(particle);
  
  anime({
    targets: particle,
    translateY: -50,
    translateX: anime.random(-20, 20),
    scale: [1, 0],
    opacity: [1, 0],
    color: ['#ff6b35', '#ffd700', '#ff0000'],
    duration: 1000,
    easing: 'easeOutQuad',
    complete: () => particle.remove()
  });
};

// Mood-based text effects
export const moodTextAnimation = (element, mood) => {
  const moodEffects = {
    happy: {
      color: '#ffd700',
      scale: [1, 1.05, 1],
      duration: 500
    },
    sad: {
      color: '#6b7ff6',
      translateY: [0, 2, 0],
      duration: 1000
    },
    excited: {
      color: '#ff6b35',
      rotate: [-2, 2, -2, 2, 0],
      duration: 300
    },
    calm: {
      color: '#10b981',
      opacity: [0.8, 1, 0.8],
      duration: 2000
    }
  };
  
  return anime({
    targets: element,
    ...moodEffects[mood],
    easing: 'easeInOutSine'
  });
};
```

---

## 🔄 Transition Animations

### Room Transitions
```javascript
export const roomTransition = (fromRoom, toRoom, direction = 'right') => {
  const timeline = anime.timeline({
    easing: 'easeInOutQuad'
  });
  
  const directions = {
    right: { from: '-100%', to: '100%' },
    left: { from: '100%', to: '-100%' },
    up: { from: '0', to: '0', fromY: '100%', toY: '-100%' },
    down: { from: '0', to: '0', fromY: '-100%', toY: '100%' }
  };
  
  const dir = directions[direction];
  
  timeline
    // Fade out current room
    .add({
      targets: fromRoom,
      translateX: dir.to || 0,
      translateY: dir.toY || 0,
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: 600
    })
    // Fade in new room
    .add({
      targets: toRoom,
      translateX: [dir.from || 0, 0],
      translateY: [dir.fromY || 0, 0],
      opacity: [0, 1],
      scale: [1.1, 1],
      duration: 600,
      offset: '-=300'
    })
    // Room elements entrance
    .add({
      targets: `${toRoom} .room-element`,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
      delay: anime.stagger(50),
      offset: '-=200'
    });
    
  return timeline;
};
```

### Modal Animations
```javascript
export const modalAnimations = {
  open: (modal) => {
    const timeline = anime.timeline({
      easing: 'easeOutQuad'
    });
    
    timeline
      // Backdrop fade
      .add({
        targets: '.modal-backdrop',
        opacity: [0, 1],
        duration: 300
      })
      // Modal entrance
      .add({
        targets: modal,
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        offset: '-=200'
      })
      // Content reveal
      .add({
        targets: `${modal} .modal-content`,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 300,
        offset: '-=200'
      });
      
    return timeline;
  },
  
  close: (modal) => {
    const timeline = anime.timeline({
      easing: 'easeInQuad'
    });
    
    timeline
      // Content hide
      .add({
        targets: `${modal} .modal-content`,
        translateY: [0, 20],
        opacity: [1, 0],
        duration: 200
      })
      // Modal exit
      .add({
        targets: modal,
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 300
      })
      // Backdrop fade
      .add({
        targets: '.modal-backdrop',
        opacity: [1, 0],
        duration: 300,
        offset: '-=200'
      });
      
    return timeline;
  }
};
```

---

## 🌟 Particle Effects

### Particle System
```javascript
class ParticleSystem {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      count: options.count || 20,
      type: options.type || 'sparkle',
      color: options.color || '#ffd700',
      duration: options.duration || 2000,
      ...options
    };
  }
  
  spawn() {
    const particles = [];
    
    for (let i = 0; i < this.options.count; i++) {
      const particle = this.createParticle();
      this.container.appendChild(particle);
      particles.push(particle);
    }
    
    this.animate(particles);
    return particles;
  }
  
  createParticle() {
    const particle = document.createElement('div');
    particle.className = `particle particle-${this.options.type}`;
    particle.style.position = 'absolute';
    particle.style.backgroundColor = this.options.color;
    
    // Random starting position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    return particle;
  }
  
  animate(particles) {
    const animations = {
      sparkle: this.sparkleAnimation,
      fire: this.fireAnimation,
      confetti: this.confettiAnimation,
      stardust: this.stardustAnimation
    };
    
    const animation = animations[this.options.type] || this.sparkleAnimation;
    animation.call(this, particles);
  }
  
  sparkleAnimation(particles) {
    anime({
      targets: particles,
      translateX: () => anime.random(-50, 50),
      translateY: () => anime.random(-50, 50),
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      duration: this.options.duration,
      delay: anime.stagger(50),
      easing: 'easeOutQuad',
      complete: () => {
        particles.forEach(p => p.remove());
      }
    });
  }
  
  fireAnimation(particles) {
    anime({
      targets: particles,
      translateY: () => anime.random(-100, -50),
      translateX: () => anime.random(-20, 20),
      scale: [1, 0],
      opacity: [1, 0],
      backgroundColor: [
        { value: '#ff6b35', duration: 200 },
        { value: '#ffd700', duration: 300 },
        { value: '#ff0000', duration: 500 }
      ],
      duration: this.options.duration,
      delay: anime.stagger(30),
      easing: 'easeOutQuad',
      complete: () => {
        particles.forEach(p => p.remove());
      }
    });
  }
  
  confettiAnimation(particles) {
    anime({
      targets: particles,
      translateY: () => anime.random(100, 200),
      translateX: () => anime.random(-100, 100),
      rotate: () => anime.random(0, 720),
      scale: [1, 0],
      opacity: [1, 0],
      duration: this.options.duration,
      delay: anime.stagger(20),
      easing: 'easeInQuad',
      complete: () => {
        particles.forEach(p => p.remove());
      }
    });
  }
  
  stardustAnimation(particles) {
    anime({
      targets: particles,
      translateY: () => anime.random(-30, 30),
      translateX: () => anime.random(-30, 30),
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      duration: this.options.duration * 2,
      delay: anime.stagger(100),
      easing: 'easeInOutSine',
      loop: true
    });
  }
}

// Usage
const particleSystem = new ParticleSystem(container, {
  count: 30,
  type: 'fire',
  color: '#ff6b35',
  duration: 1500
});
particleSystem.spawn();
```

---

## 🎨 Pixel Art Specific Animations

### Pixel Perfect Movements
```javascript
// Ensure pixel-perfect positioning
export const pixelMove = (element, x, y) => {
  const pixelSize = 4; // Size of each "pixel"
  
  return anime({
    targets: element,
    translateX: Math.round(x / pixelSize) * pixelSize,
    translateY: Math.round(y / pixelSize) * pixelSize,
    duration: 300,
    easing: 'steps(8)' // Step easing for pixel feel
  });
};

// Pixel fade effect
export const pixelFade = (element, fadeIn = true) => {
  const pixels = createPixelGrid(element);
  
  return anime({
    targets: pixels,
    opacity: fadeIn ? [0, 1] : [1, 0],
    duration: 50,
    delay: anime.stagger(10, {
      grid: [8, 8],
      from: 'center'
    }),
    easing: 'steps(2)',
    complete: () => {
      if (!fadeIn) {
        pixels.forEach(p => p.remove());
      }
    }
  });
};

// Pixel explosion effect
export const pixelExplode = (element) => {
  const pixels = createPixelGrid(element);
  
  return anime({
    targets: pixels,
    translateX: () => anime.random(-100, 100),
    translateY: () => anime.random(-100, 100),
    scale: [1, 0],
    opacity: [1, 0],
    duration: 1000,
    delay: anime.stagger(5, {
      grid: [8, 8],
      from: 'center'
    }),
    easing: 'easeOutQuad',
    complete: () => {
      pixels.forEach(p => p.remove());
    }
  });
};
```

---

## 🔊 Animation with Sound Integration

```javascript
// Sync animations with sound
export const animateWithSound = (animation, soundFile) => {
  const audio = new Audio(soundFile);
  
  animation.begin = () => {
    audio.play();
  };
  
  // Adjust animation timing to match sound
  if (audio.duration) {
    animation.duration = audio.duration * 1000;
  }
  
  return animation;
};

// Sound-reactive animations
export const soundReactiveAnimation = async (element, audioUrl) => {
  const audioContext = new AudioContext();
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  const animate = () => {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    anime({
      targets: element,
      scale: 1 + (average / 256) * 0.5,
      duration: 100,
      easing: 'linear'
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};
```

---

## 🛠️ Utility Functions

### Animation Helpers
```javascript
// Chain multiple animations
export const chainAnimations = (...animations) => {
  const timeline = anime.timeline();
  animations.forEach(anim => timeline.add(anim));
  return timeline;
};

// Stagger elements with custom pattern
export const customStagger = (elements, pattern) => {
  const patterns = {
    wave: (el, i) => i * 50,
    random: () => anime.random(0, 500),
    center: (el, i, l) => Math.abs(i - l/2) * 50,
    edges: (el, i, l) => Math.min(i, l-i-1) * 50
  };
  
  return anime({
    targets: elements,
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 500,
    delay: patterns[pattern] || patterns.wave
  });
};

// Responsive animations
export const responsiveAnimation = (element, animations) => {
  const breakpoints = {
    mobile: 640,
    tablet: 1024,
    desktop: 1440
  };
  
  const width = window.innerWidth;
  let animation;
  
  if (width < breakpoints.mobile) {
    animation = animations.mobile;
  } else if (width < breakpoints.tablet) {
    animation = animations.tablet;
  } else {
    animation = animations.desktop;
  }
  
  return anime({
    targets: element,
    ...animation
  });
};

// Performance monitoring
export const monitorAnimation = (animation, name) => {
  const startTime = performance.now();
  
  animation.complete = () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 1000) {
      console.warn(`Animation "${name}" took ${duration}ms - consider optimization`);
    }
    
    // Send to analytics
    if (window.analytics) {
      window.analytics.track('Animation Performance', {
        name,
        duration,
        fps: Math.round(1000 / (duration / animation.duration))
      });
    }
  };
  
  return animation;
};
```

---

## 📚 Animation Presets Export

```javascript
// Export all animation presets for use across the app
export const AnimationPresets = {
  // Entrances
  fadeIn: { opacity: [0, 1], duration: 500 },
  slideIn: { translateX: [-100, 0], opacity: [0, 1], duration: 600 },
  bounceIn: { scale: [0, 1], duration: 600, easing: 'easeOutElastic(1, 0.5)' },
  
  // Exits
  fadeOut: { opacity: [1, 0], duration: 500 },
  slideOut: { translateX: [0, 100], opacity: [1, 0], duration: 600 },
  shrinkOut: { scale: [1, 0], duration: 400, easing: 'easeInBack' },
  
  // Interactions
  pulse: { scale: [1, 1.05, 1], duration: 600 },
  shake: { translateX: [-10, 10, -10, 10, 0], duration: 500 },
  wiggle: { rotate: [-5, 5, -5, 5, 0], duration: 400 },
  
  // Continuous
  float: {
    translateY: [-10, 10],
    duration: 3000,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine'
  },
  rotate: {
    rotate: 360,
    duration: 20000,
    loop: true,
    easing: 'linear'
  },
  glow: {
    opacity: [0.5, 1],
    duration: 2000,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine'
  }
};

// Usage
anime({
  targets: '.element',
  ...AnimationPresets.bounceIn
});
```

---

## 🎯 Performance Best Practices

### Optimization Checklist
```javascript
/*
 * Performance Guidelines:
 * 
 * 1. Use transform and opacity only when possible
 * 2. Avoid animating width, height, top, left, right, bottom
 * 3. Use will-change sparingly on critical animations
 * 4. Batch DOM manipulations
 * 5. Use requestAnimationFrame for custom animations
 * 6. Limit concurrent animations to 3-4
 * 7. Use CSS animations for simple, repetitive effects
 * 8. Debounce rapid animation triggers
 * 9. Clean up completed animations
 * 10. Profile animations in DevTools
 */

// Animation performance manager
class AnimationManager {
  constructor(maxConcurrent = 3) {
    this.activeAnimations = new Set();
    this.queue = [];
    this.maxConcurrent = maxConcurrent;
  }
  
  add(animation) {
    if (this.activeAnimations.size < this.maxConcurrent) {
      this.play(animation);
    } else {
      this.queue.push(animation);
    }
  }
  
  play(animation) {
    this.activeAnimations.add(animation);
    animation.complete = () => {
      this.activeAnimations.delete(animation);
      this.playNext();
    };
    animation.play();
  }
  
  playNext() {
    if (this.queue.length > 0 && this.activeAnimations.size < this.maxConcurrent) {
      const next = this.queue.shift();
      this.play(next);
    }
  }
  
  clear() {
    this.activeAnimations.forEach(anim => anim.pause());
    this.activeAnimations.clear();
    this.queue = [];
  }
}

export const animationManager = new AnimationManager();
```

---

*Document Version: 1.0*
*Last Updated: November 2024*