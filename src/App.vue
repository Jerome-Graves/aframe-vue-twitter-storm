<template>
  <div id="app">
    <a-scene
      renderer="antialias: true;
                colorManagement: true;
                sortObjects: true;"
    >
      <Boid v-for="b in boidData" :key="b.index" :b-data="b" />

      <a-camera position="0 0 34" fov="55" near="1" wasd-controls-enabled="false"></a-camera>

      <a-sky
        color="#14171A"
        animation__color="property: components.material.material.color;
                          type: color;
                          to: #1DA1F2;
                          dur: 10000;
                          dir: alternate;
                          loop: true;
                          elasticity: 1000;"
      ></a-sky>
    </a-scene>
  </div>
</template>

<script>
import Boid from "./components/Boid.vue";
import "aframe";

export default {
  name: "App",
  components: { Boid },
  data() {
    return {
      totalBoids: 40,
      spawn: 16, // birds start within +/- spawn/2 of the origin
      boidData: [],
    };
  },
  methods: {
    createBoids() {
      const s = this.spawn;
      for (let i = 0; i < this.totalBoids; i++) {
        this.boidData.push({
          index: "boid" + i,
          px: -s / 2 + Math.random() * s,
          py: -s / 2 + Math.random() * s,
          pz: -s / 2 + Math.random() * s,
        });
      }
    },
  },
  beforeMount() {
    this.createBoids();
  },
};
</script>

<style>
html, body { margin: 0; height: 100%; overflow: hidden; }
</style>
