export interface Data {
  recipesText: string;
  measurementsText: string;
  aislesText: string;
}

export class DataFetcher {
  $http: any;
  $q: any;

  constructor($http, $q) {
    this.$http = $http;
    this.$q = $q;
  }

  private fetch(name) {
    return this.$http.get('/data/' + name + '.txt').then(function(response) {
      return response.data;
    });
  }

  // TODO: Annotate the return type.
  public fetchAll() {
    var fetches = [
      this.fetch('recipes'),
      this.fetch('measurements'),
      this.fetch('aisles')
    ];
    return this.$q.all(fetches).then(function(data) {
      return {
        recipesText: data[0],
        measurementsText: data[1],
        aislesText: data[2],
      };
    });
  }
}
