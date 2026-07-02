<template>
  <a-entity
    boid
    :position="bData.px + ' ' + bData.py + ' ' + bData.pz"
    scale="1.5 1.5 1.5"
    gltf-model="bird.glb"
  ></a-entity>
</template>

<script>
// A single bird. All motion is handled by the `boid` A-Frame system
// (see ../flock.js); this component just spawns the entity at its start
// position and attaches the `boid` component.
export default {
  name: "Boid",
  props: {
    bData: { type: Object, required: true },
  },
};
</script>

<style scoped></style>
