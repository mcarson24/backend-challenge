<template>
  <div>
    <div>
      <label for="at">At:</label>
      <flat-pickr v-model="at" :config="dateConfig"></flat-pickr>
      <button @click="getDataAt" :disabled="!at">Get</button>
    </div>
    <div>
      <div>
        <label for="from">From:</label>
        <flat-pickr v-model="from" :config="dateConfig"></flat-pickr>
      </div>
      <div>
        <label for="to">To:</label>
        <flat-pickr v-model="to" :config="dateConfig"></flat-pickr>
      </div>
      <label for="station">Station ID:</label>
      <select name="station" id="station" v-model="desiredKiosk" required>
        <option value="" disabled>Select a station</option>
        <option v-for="station in stationIds" 
                :value="station.id" 
                v-text="station.name"
                v-bind:key="station.id"
                >
        </option>
      </select>
    </div>
    <button @click="getRange" :disabled="!from || !to || !desiredKiosk">Get</button>
    <div v-if="show">
      <h2 v-text="message"></h2>
      <div class="flex" v-if="weather !== '' && info == 'data'">
				<img :src="weatherIcon">
				<div class="flex flex-col justify-center">
					<div class="text-3xl flex">{{ weather.main.temp }}&deg;</div>
		      <span v-text="weather.weather.description"></span>
				</div>
			</div>
      <div v-if="info == 'data'">
        <div>
          <h3>Bikes Available</h3>
          <ul>
            <li>
              <span v-text="classicBikesAvailable"></span> classic bikes
            </li>
            <li>
              <span v-text="electricBikesAvailable"></span> electric bikes
            </li>
          </ul>
        </div>
        <div>
          <h3>Station Status</h3>
          <ul>
            <li>
              <span v-text="fullStations"></span> were full.
            </li>
            <li>
              <span v-text="emptyStations"></span> were empty.
            </li>
          </ul>
        </div>
      </div>
      <div v-if="info == 'range'">
        <p v-text="weatherMessage"></p>
        <p>On average, there were about {{(docksAvailable / snapshots).toFixed(0)}} docks available and {{(bikesAvailable / snapshots).toFixed(0)}} bikes available.</p>
        <a :href="fullDataLink">View full JSON data</a>
      </div>
    </div>
  </div>  
</template>

<script>
  import flatPickr from 'vue-flatpickr-component';
  import 'flatpickr/dist/flatpickr.css';
  import moment from 'moment';

  export default {
    components: { flatPickr },
    data() {
      return {
        from: '',
        to: '',
        at: '',
        show: false,
        info: '',
        stationName: '',
        stationIds: [],
        message: '',
        weatherMessage: '',
        snapshots: 0,
        desiredKiosk: '',
        weather: '',
        temp: 0,
        docksAvailable: 0,
        bikesAvailable: 0,
        fullStations: 0,
        emptyStations: 0,
        fullDataLink: '',
        classicBikesAvailable: 0,
        electricBikesAvailable: 0,
        dateConfig: {
          enableTime: true,
          enableSeconds: true,
        }
      }
    },
    mounted() {
      this.getStationsInfo();
    },
    methods: {
      getRange() {
        if (!this.from || !this.to || !this.desiredKiosk) return;
        this.temp = this.bikesAvailable = this.docksAvailable = 0;
        this.show = true;
        this.info = 'range';
        fetch(`/api/v1/stations/${this.desiredKiosk}?from=${this.fromQueryString}&to=${this.toQueryString}`)
          .then(res => res.json())
          .then(res => {
            this.stationName = res[0].station.properties.name;
            this.snapshots = res.length;
            this.message = `There have been ${this.snapshots} snapshots taken for '${this.stationName}' during that time period.`;
            this.fullDataLink = `/api/v1/stations/${this.desiredKiosk}?from=${this.fromQueryString}&to=${this.toQueryString}${this.frequency ? '&frequency=daily' : ''}`;
            res.map(snapshot => {
              this.temp += snapshot.weather.main.temp;
              this.bikesAvailable += snapshot.station.properties.bikesAvailable;
              this.docksAvailable += snapshot.station.properties.docksAvailable;
            });
            this.weatherMessage = `Average temperature during those snapshots was ${(this.temp / this.snapshots).toFixed(2)}`;
          });
      },
      getDataAt() {
        if (!this.at) return;
        this.show = true;
        this.info = 'data';
        this.classicBikesAvailable = this.electricBikesAvailable = this.fullStations = this.emptyStations = 0;
        fetch(`/api/v1/stations?at=${this.atQueryString}`)
          .then(res => res.json())
          .then(({at, stations, weather}) => {
            const date = moment(this.reformatDate(at));
            this.message = `The closest snapshot to that time was taken on ${date.format('dddd, MMMM Do YYYY')} at ${date.format('H:mm:ss a')}.`;
            this.weather = weather;
            
            stations.map(({properties}) => {
              if (properties.docksAvailable == 0) this.fullStations++;
              if (properties.bikesAvailable == 0) this.emptyStations++;
              this.electricBikesAvailable += parseInt(properties.electricBikesAvailable);
              this.classicBikesAvailable += parseInt(properties.classicBikesAvailable);
            });
          });
      },
      reformatDate(date) {
        const day = date.substr(0, 10);
        const time = date.substr(date.indexOf('T') + 1);

        return `${day} ${time}`;
      },
      getStationsInfo() {
        fetch('/api/v1/stations')
        .then(res => res.json())
        .then(({stations}) => {
          stations.map(({properties}) => {
            this.stationIds.push({
              id: properties.kioskId,
              name: properties.name
            });
          });
        });
      }
    },
    computed: {
      toQueryString() {
        return moment(this.to).format('YYYY-MM-DDTHH:mm:ss');
      },
      fromQueryString() {
        return moment(this.from).format('YYYY-MM-DDTHH:mm:ss');
      },
      atQueryString() {
        return moment(this.at).format('YYYY-MM-DDTHH:mm:ss');
      },
      weatherIcon() {
				return `https://openweathermap.org/img/wn/${this.weather.weather[0].icon}@2x.png`
			},
    }
  }
</script>
