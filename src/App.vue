<template>
  <div id="app">
    <!--
  -->

    <a-scene
      renderer="antialias: false;
                   colorManagement: true;
                   sortObjects: true;
                   physicallyCorrectLights: false;
                   maxCanvasWidth: 1024;
                   maxCanvasHeight: 1024;"
    >
      <Boid
        v-for="Boid in boidData"
        :bData="Boid"
        :key="Boid.index"
        :id="Boid.index"
      />
      <a-camera position="0 0 50" fov="40" near="1"></a-camera>
      <a-sky
        position="0 0 0"
        color="#14171A"
        animation__color="property: components.material.material.color;  
        type: color;
      to: #F5F8FA;
      dur: 10000;
      dir: alternate;
      loop: true;
      elasticity: 1000;
      "
      ></a-sky>
    </a-scene>
  </div>
</template>

<script>
import Boid from "./components/Boid";
import aframe from "aframe";

export default {
  name: "App",
  data() {
    return {
      totalBoids: 15,
      maxSize: 20,
      boidData: [],
    };
  },
  components: {
    Boid,
  },
  methods: {
    createBoids() {
      for (let i = 0; i < this.totalBoids - 1; i++) {
        this.boidData.push({
          index: "boid" + i,
          px: -this.maxSize / 2 + Math.floor(Math.random() * this.maxSize),
          py: -this.maxSize / 2 + Math.floor(Math.random() * this.maxSize),
          pz: -this.maxSize / 4 - Math.floor(Math.random() * this.maxSize),
          rx: Math.floor(Math.random() * 360),
          ry: Math.floor(Math.random() * 360),
          rz: Math.floor(Math.random() * 360),
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
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
