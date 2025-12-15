/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Public pages
import Landing from "layouts/landing";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// Common
import Profile from "layouts/profile";

// App pages (Seguradora)
import SeguradoraApolicesPendentes from "layouts/seguradora/apolices/pendentes";
import SeguradoraApolicesAtivas from "layouts/seguradora/apolices/ativas";
import SeguradoraApoliceDetalhe from "layouts/seguradora/apolices/detalhe";
import SeguradoraSinistrosPendentes from "layouts/seguradora/sinistros/pendentes";
import SeguradoraSinistrosEmAnalise from "layouts/seguradora/sinistros/em-analise";
import SeguradoraSinistroDetalhe from "layouts/seguradora/sinistros/detalhe";

// App pages (Corretora)
import CorretoraPropostasLista from "layouts/corretora/propostas/lista";
import CorretoraPropostaNova from "layouts/corretora/propostas/nova";
import CorretoraPropostaDetalhe from "layouts/corretora/propostas/detalhe";

// App pages (Cliente)
import ClienteApolicesLista from "layouts/cliente/apolices/lista";
import ClienteApolicesAtivas from "layouts/cliente/apolices/ativas";
import ClienteApoliceDetalhe from "layouts/cliente/apolices/detalhe";
import ClienteApolicePagamentos from "layouts/cliente/apolices/pagamentos";
import ClienteSinistrosLista from "layouts/cliente/sinistros/lista";
import ClienteSinistroNovo from "layouts/cliente/sinistros/novo";
import ClienteSinistroDetalhe from "layouts/cliente/sinistros/detalhe";
import ClienteSinistroAcompanhamento from "layouts/cliente/sinistros/acompanhamento";
import ClientePagamentosLista from "layouts/cliente/pagamentos/lista";
import ClientePagamentosPendentes from "layouts/cliente/pagamentos/pendentes";
import ClientePagamentosAtrasados from "layouts/cliente/pagamentos/atrasados";
import ClientePagamentoDetalhe from "layouts/cliente/pagamentos/detalhe";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "route",
    name: "Landing",
    key: "landing",
    route: "/",
    component: <Landing />,
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  {
    type: "collapse",
    name: "Perfil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    protected: true,
  },

  {
    type: "title",
    title: "Seguradora",
    key: "title-seguradora",
    allowedPerfis: ["seguradora"],
  },
  {
    type: "collapse",
    name: "Apólices pendentes",
    key: "seg-apolices-pendentes",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/seguradora/apolices/pendentes",
    component: <SeguradoraApolicesPendentes />,
    protected: true,
    allowedPerfis: ["seguradora"],
  },
  {
    type: "collapse",
    name: "Apólices ativas",
    key: "seg-apolices-ativas",
    icon: <Icon fontSize="small">verified</Icon>,
    route: "/seguradora/apolices/ativas",
    component: <SeguradoraApolicesAtivas />,
    protected: true,
    allowedPerfis: ["seguradora"],
  },
  {
    type: "collapse",
    name: "Sinistros pendentes",
    key: "seg-sinistros-pendentes",
    icon: <Icon fontSize="small">gavel</Icon>,
    route: "/seguradora/sinistros/pendentes",
    component: <SeguradoraSinistrosPendentes />,
    protected: true,
    allowedPerfis: ["seguradora"],
  },
  {
    type: "collapse",
    name: "Sinistros em análise",
    key: "seg-sinistros-em-analise",
    icon: <Icon fontSize="small">manage_search</Icon>,
    route: "/seguradora/sinistros/em-analise",
    component: <SeguradoraSinistrosEmAnalise />,
    protected: true,
    allowedPerfis: ["seguradora"],
  },

  {
    type: "route",
    name: "Detalhe apólice (seguradora)",
    key: "seg-apolice-detalhe",
    route: "/seguradora/apolices/:apoliceId",
    component: <SeguradoraApoliceDetalhe />,
    protected: true,
    allowedPerfis: ["seguradora"],
  },
  {
    type: "route",
    name: "Detalhe sinistro (seguradora)",
    key: "seg-sinistro-detalhe",
    route: "/seguradora/sinistros/:sinistroId",
    component: <SeguradoraSinistroDetalhe />,
    protected: true,
    allowedPerfis: ["seguradora"],
  },

  {
    type: "title",
    title: "Corretora",
    key: "title-corretora",
    allowedPerfis: ["corretora"],
  },
  {
    type: "collapse",
    name: "Propostas",
    key: "cor-propostas",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/corretora/propostas",
    component: <CorretoraPropostasLista />,
    protected: true,
    allowedPerfis: ["corretora"],
  },
  {
    type: "collapse",
    name: "Nova proposta",
    key: "cor-proposta-nova",
    icon: <Icon fontSize="small">add</Icon>,
    route: "/corretora/propostas/nova",
    component: <CorretoraPropostaNova />,
    protected: true,
    allowedPerfis: ["corretora"],
  },
  {
    type: "route",
    name: "Detalhe proposta",
    key: "cor-proposta-detalhe",
    route: "/corretora/propostas/:propostaId",
    component: <CorretoraPropostaDetalhe />,
    protected: true,
    allowedPerfis: ["corretora"],
  },

  {
    type: "title",
    title: "Cliente",
    key: "title-cliente",
    allowedPerfis: ["cliente"],
  },
  {
    type: "collapse",
    name: "Minhas apólices",
    key: "cli-apolices",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/cliente/apolices",
    component: <ClienteApolicesLista />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "collapse",
    name: "Apólices ativas",
    key: "cli-apolices-ativas",
    icon: <Icon fontSize="small">verified</Icon>,
    route: "/cliente/apolices/ativas",
    component: <ClienteApolicesAtivas />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "collapse",
    name: "Sinistros",
    key: "cli-sinistros",
    icon: <Icon fontSize="small">report</Icon>,
    route: "/cliente/sinistros",
    component: <ClienteSinistrosLista />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "collapse",
    name: "Novo sinistro",
    key: "cli-sinistro-novo",
    icon: <Icon fontSize="small">add_circle</Icon>,
    route: "/cliente/sinistros/novo",
    component: <ClienteSinistroNovo />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "collapse",
    name: "Pagamentos",
    key: "cli-pagamentos",
    icon: <Icon fontSize="small">payments</Icon>,
    route: "/cliente/pagamentos",
    component: <ClientePagamentosLista />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "collapse",
    name: "Pendentes",
    key: "cli-pagamentos-pendentes",
    icon: <Icon fontSize="small">schedule</Icon>,
    route: "/cliente/pagamentos/pendentes",
    component: <ClientePagamentosPendentes />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "collapse",
    name: "Atrasados",
    key: "cli-pagamentos-atrasados",
    icon: <Icon fontSize="small">warning</Icon>,
    route: "/cliente/pagamentos/atrasados",
    component: <ClientePagamentosAtrasados />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "route",
    name: "Detalhe apólice (cliente)",
    key: "cli-apolice-detalhe",
    route: "/cliente/apolices/:apoliceId",
    component: <ClienteApoliceDetalhe />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "route",
    name: "Pagamentos apólice (cliente)",
    key: "cli-apolice-pagamentos",
    route: "/cliente/apolices/:apoliceId/pagamentos",
    component: <ClienteApolicePagamentos />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "route",
    name: "Detalhe sinistro (cliente)",
    key: "cli-sinistro-detalhe",
    route: "/cliente/sinistros/:sinistroId",
    component: <ClienteSinistroDetalhe />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "route",
    name: "Acompanhamento sinistro (cliente)",
    key: "cli-sinistro-acompanhamento",
    route: "/cliente/sinistros/:sinistroId/acompanhamento",
    component: <ClienteSinistroAcompanhamento />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
  {
    type: "route",
    name: "Detalhe pagamento (cliente)",
    key: "cli-pagamento-detalhe",
    route: "/cliente/pagamentos/:pagamentoId",
    component: <ClientePagamentoDetalhe />,
    protected: true,
    allowedPerfis: ["cliente"],
  },
];

export default routes;
