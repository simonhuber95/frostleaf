import * as db from '../clients/db';
import * as trefleClient from '../clients/trefle';

export async function listPlants() {
  return db.findAllPlants();
}

export async function getPlant(id: string) {
  return db.findPlantById(id);
}

export async function searchSpeciesByQuery(query: string, page = 1) {
  return trefleClient.searchSpecies(query, page);
}

export async function getSpecies(id: number) {
  return trefleClient.getSpeciesById(id);
}

export async function searchPlantsByQuery(query: string, page = 1) {
  return trefleClient.searchPlants(query, page);
}

export async function getPlantFromCatalog(id: number) {
  return trefleClient.getPlantById(id);
}
