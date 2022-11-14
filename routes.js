import { Router, json } from "express";
import {
  assinanteIndex,
  assinanteStore,
} from "./controllers/AssinantesController.js";
import {
  createFilme,
  deleteFilme,
  getFilmes,
  pesqAno,
  pesqFilme,
  updateFilme,
} from "./controllers/FilmesController.js";
import { loginAssinante } from "./controllers/LoginAssinanteController.js";
import {
  createSerie,
  deleteSerie,
  getSeries,
  pesqSerie,
  pesqTemporadas,
  seriesDadosGerais,
  updateSerie,
} from "./controllers/SeriesController.js";
import { verificaLoginCliente } from "./middlewares/VerificaLogin.js";
import upload from "./middlewares/CartazStore.js";
import {
  votoConfirm,
  votoIndex,
  votoStore,
} from "./controllers/VotosController.js";
import { verificaConf } from "./middlewares/VerificaConf.js";
const router = Router();

router.use(json());

// Gerenciamento de Filmes
router
  .get("/netflix/filmes", verificaLoginCliente, getFilmes)
  .post("/netflix/filmes", upload.single("foto"), createFilme)
  .put("/netflix/filmes/:id", updateFilme)
  .delete("/netflix/filmes/:id", deleteFilme)
  .get("/netflix/filmes/pesq/nome/:nome", pesqFilme)
  .get("/netflix/filmes/pesq/ano/:from-:to", pesqAno);

// Gerenciamento de Series
router
  .get("/netflix/series", verificaLoginCliente, getSeries)
  .post("/netflix/series", createSerie)
  .put("/netflix/series/:id", updateSerie)
  .delete("/netflix/series/:id", deleteSerie)
  .get("/netflix/series/pesq/nome/:nome", pesqSerie)
  .get("/netflix/series/pesq/temporadas/:from-:to", pesqTemporadas);

// Gerenciamento de Assinantes
router
  .get("/netflix/assinantes", verificaLoginCliente, assinanteIndex)
  .post("/netflix/assinantes", assinanteStore);

// login Assinante
router.get("/netflix/login_assinante", loginAssinante);

// Votação melhor série
router
  .get("/netflix/votos", votoIndex)
  .post("/netflix/votos", votoStore)
  .get("/votos/confirma/:hash", verificaConf, votoConfirm);

// Dados estatísticos
router.get("/netflix/dadosgerais", seriesDadosGerais);
export default router;
