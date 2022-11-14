import dbknex from "../data/db_config.js";

export const getSeries = async (req, res) => {
  try {
    const series = await dbknex.select("*").from("series");
    res.status(200).json(series);
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro" + error.message });
  }
};

export const createSerie = async (req, res) => {
  const { nome, categoria, qtd_temporadas } = req.body;

  if (!nome || !categoria || !qtd_temporadas) {
    res.status(400).json({
      id: 0,
      msg: "Erro... informe nome, categoria e qtd_temporadas",
    });
    return;
  }

  try {
    const newSerie = await dbknex("series").insert({
      nome,
      categoria,
      qtd_temporadas,
    });
    res
      .status(200)
      .json({ id: newSerie[0], msg: "Serie incluída com sucesso!" });
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro " + error.message });
  }
};

export const updateSerie = async (req, res) => {
  const { nome, categoria, qtd_temporadas } = req.body;
  const { id } = req.params;

  try {
    await dbknex("series")
      .where({ id })
      .update({ nome, categoria, qtd_temporadas });
    res.status(200).json({ id, msg: "Serie alterada com sucesso!" });
  } catch (error) {
    res.status(400).json({ id, msg: "Erro: " + error.message });
  }
};

export const deleteSerie = async (req, res) => {
  const { id } = req.params;

  try {
    await dbknex("series").where({ id }).del();
    res.status(200).json({ id, msg: "Serie deletada com sucesso!" });
  } catch (error) {
    res.status(400).json({ id, msg: "Erro " + error.message });
  }
};

export const pesqSerie = async (req, res) => {
  const { nome } = req.params;

  try {
    const serie = await dbknex("series")
      .whereLike("nome", `%${nome}%`)
      .orderBy("nome");
    res.status(200).json(serie);
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro " + error.message });
  }
};

export const pesqTemporadas = async (req, res) => {
  const { from, to } = req.params;

  try {
    const series = await dbknex("series")
      .whereBetween("qtd_temporadas", [from, to])
      .orderBy("qtd_temporadas");
    res.status(200).json(series);
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};

// DADOS ESTATÍSTICOS
export const seriesDadosGerais = async (req, res) => {
  try {
    // consulta com count, min, max e avg
    const consulta = await dbknex("series")
      .count({ num: "*" })
      .min({ menor: "votos" })
      .max({ maior: "votos" })
      .avg({ media: "votos" });

    // a consulta retorna um array de objetos
    // consulta[0] = {num: 9, menor: 19, maior: 28, media: 24.5}
    const { num, menor, maior, media } = consulta[0];

    res
      .status(200)
      .json({ num, menor, maior, media: Number(media).toFixed(1) });
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};

// retorna dados estatísticos do cadastro de candidatas
export const candidataPorCidade = async (req, res) => {
  try {
    // consulta com agrupamento
    const consulta = await dbKnex("candidatas")
      .select("cidade")
      .count({ num: "*" })
      .groupBy("cidade");
    res.status(200).json(consulta);
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};

// retorna dados estatísticos do cadastro de candidatas
export const candidataPremiadas = async (req, res) => {
  try {
    // consulta com ordenação e limite de registros retornados
    const consulta = await dbKnex("candidatas")
      .select("nome", "votos")
      .orderBy("votos", "desc")
      .limit(5);
    res.status(200).json(consulta);
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};

// retorna dados estatísticos do cadastro de candidatas
export const candidataTotalVotos = async (req, res) => {
  try {
    // consulta com sum e max
    const consulta = await dbKnex("candidatas")
      .sum({ total: "votos" })
      .max({ maior: "votos" });

    // a consulta retorna um array de objetos
    const { total, maior } = consulta[0];

    res.status(200).json({ total, maior });
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};
