import dbKnex from "../data/db_config.js";
import md5 from "md5";
import nodemailer from "nodemailer";

export const votoIndex = async (req, res) => {
  try {
    // obtém da tabela de votos todos os registros
    const votos = await dbKnex
      .select("v.*", "s.nome as serie")
      .from("votos as v")
      .innerJoin("series as s", { "v.serie_id": "s.id" });
    res.status(200).json(votos);
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};

// async..await is not allowed in global scope, must use a wrapper
async function send_email(nome, email, hash) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "3f3918f4336747",
      pass: "6db9c65d74c3ce",
    },
  });

  const urlConfirmacao = "http://localhost:3000/votos/confirma/" + hash;

  let mensa = "<h3>Votação melhor série 2023 na Netflix</h3>";
  mensa += "<p>Por favor, confirme seu voto clicando no link:</p>";
  mensa += `<a href=${urlConfirmacao}>Confirmar Voto</a>`;

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Netflix - Votação melhor filme 2023" <netflix@netflix.com>', // sender address
    to: email, // list of receivers
    subject: "Confirmação de Voto", // Subject line
    text: `Para confirmar o voto, copie e cole o link:\n${urlConfirmacao}`,
    html: mensa, // html body
  });
}

export const votoStore = async (req, res) => {
  // atribui via desestruturação
  const { nome, email, serie_id } = req.body;

  // se não informou estes atributos
  if (!nome || !email || !serie_id) {
    res.status(400).json({
      id: 0,
      msg: "Erro... informe nome, email e serie_id do voto",
    });
    return;
  }

  try {
    // obtém da tabela de candidatas todos os registros da marca indicada
    const verifica = await dbKnex("votos").where({ email });

    // se a consulta retornou algum registro (significa que já votou)
    if (verifica.length > 0) {
      res.status(400).json({ id: 0, msg: "Erro... este e-mail já votou" });
      return;
    }
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Vai tomar no cu " + error.message });
    return;
  }

  // gera um hash (código) a partir do email, serie_id e data atual
  const hash = md5(email + serie_id + Date.now());

  try {
    // insere um registro na tabela de votos, que deverá ser confirmado
    const novo = await dbKnex("votos").insert({
      nome,
      email,
      serie_id,
      hash_conf: hash,
    });

    // chama a função de envio do e-mail passando os parâmetros a
    // serem utilizados
    send_email(nome, email, hash).catch(console.error);

    // novo[0] => retorna o id do registro inserido
    res.status(201).json({
      id: novo[0],
      msg: "Confirme o voto a partir da sua conta de e-mail",
    });
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};

export const votoConfirm = async (req, res) => {
  // obtém o parâmetro com o hash para confirmação do voto
  const { hash } = req.params;

  // declara a variável que será utilizada dentro e fora do bloco
  let voto;
  try {
    // obtém da tabela de votos o voto com o hash informado
    voto = await dbKnex("votos").where({ hash_conf: hash });

    // se a consulta retornou algum registro (significa que já votou)
    if (voto.length == 0) {
      res
        .status(400)
        .send("Código inválido. Por favor, copie e cole novamente");
      return;
    }
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
    return;
  }

  // define (inicia) uma nova transação
  const trx = await dbKnex.transaction();

  try {
    // 1ª operação da transação: alterar o status do voto
    // para confirmado
    const novo = await trx("votos")
      .where({ hash_conf: hash })
      .update({ confirmado: 1 });

    // 2ª operação da transação: aumentar o número de votos
    // candidata
    await trx("series").where({ id: voto[0].serie_id }).increment({ votos: 1 });

    // commit (grava) a transação
    await trx.commit();

    // mensagem de confirmação
    res.status(201).send("Obrigado! Voto confirmado com sucesso.");
  } catch (error) {
    // rollback (volta) desfaz a operação realizada
    await trx.rollback();

    res.status(400).json({ id: 0, msg: "Erro: " + error.message });
  }
};
