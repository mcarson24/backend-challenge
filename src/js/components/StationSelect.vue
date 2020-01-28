<template>
  <select @input="changed" 
          ref="stationSelect"
          :value="value.station"
          :required="required"
          v-model="selectedStation"
          class="w-full py-2 px-2 mb-5 rounded"
          >
    <option v-if="allowAll" value="">All stations</option>
    <option v-else value="" disabled>Select a station</option>
    <option v-for="station in stations" 
            :value="station.id" 
            v-text="station.name"
            v-bind:key="station.id"
            >
    </option>
  </select>
</template>

<script>
  import '../../css/styles.css';
  export default {
    props: ['value', 'required', 'allowAll'],
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
        this.$emit('input', +this.$refs.stationSelect.value);
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
