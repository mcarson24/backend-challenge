<template>
  <select @input="changed" 
          ref="stationSelect"
          :value="value.station"
          :required="required"
          v-model="selectedStation"
          >
    <option value="" disabled>Select a station</option>
    <option v-for="station in stations" 
            :value="station.id" 
            v-text="station.name"
            v-bind:key="station.id"
            >
    </option>
  </select>
</template>

<script>
  export default {
    props: ['value', 'required'],
    data() {
      return {
        stations: [],
        selectedStation: ''
      }
    },
     mounted() {
      this.getStationInfo();
    },
    methods: {
      changed() {
        this.$emit('input', this.$refs.stationSelect.value);
      },
      getStationInfo() {
         fetch('/api/v1/stations')
         .then(res => res.json())
         .then(({stations}) => {
           stations.map(({properties}) => {
             this.stations.push({
               id: properties.kioskId,
               name: properties.name
             });
           });
         });
       }
    }
  }
</script>
