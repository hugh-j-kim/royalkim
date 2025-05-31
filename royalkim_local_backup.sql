--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Blog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Blog" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "customUrl" text NOT NULL
);


ALTER TABLE public."Blog" OWNER TO postgres;

--
-- Name: Post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Post" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "blogId" text NOT NULL,
    year integer,
    description text
);


ALTER TABLE public."Post" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    password text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text DEFAULT 'PENDING'::text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Blog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Blog" (id, title, description, "createdAt", "updatedAt", "userId", "isPublic", "customUrl") FROM stdin;
cmb9bjaez0002b2shi0ndvcnx	royalkim의 블로그	royalkim의 블로그에 오신 것을 환영합니다.	2025-05-29 11:56:27.132	2025-05-29 11:56:27.132	cmb9bjaex0000b2shlxe8e868	t	royalkim-blog
cmb9f4u7j0002b23cx07k10oc	user1의 블로그	user1의 블로그에 오신 것을 환영합니다.	2025-05-29 13:37:11.407	2025-05-29 13:37:11.407	cmb9f4u7f0000b23cdcloweim	t	user1-blog
cmb9f56e60005b23c0wx1esi6	user2의 블로그	user2의 블로그에 오신 것을 환영합니다.	2025-05-29 13:37:27.198	2025-05-29 13:37:27.198	cmb9f56e50003b23cm8bslg6h	t	user2-blog
cmb9frcis0004b2tq5j7cf7bq	user3의 블로그	user3의 블로그에 오신 것을 환영합니다.	2025-05-29 13:54:41.573	2025-05-29 13:54:41.573	cmb9frciq0002b2tqgmyygz68	t	user3-blog
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Post" (id, title, content, published, "createdAt", "updatedAt", "authorId", "viewCount", "blogId", year, description) FROM stdin;
cmb9fqnbs0001b2tqb9gx4loi	렉슨	<p>렉슨의 예쁜 무드등</p>\n<p><iframe src="https://www.youtube.com/embed/2JKzblGJ1Xk?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-05-29 13:54:08.921	2025-05-29 13:54:08.921	cmb9bjaex0000b2shlxe8e868	0	cmb9bjaez0002b2shi0ndvcnx	\N	\N
cmbar56bh0001b2hhd78bnxt3	아이폰 ***	<p>아이폰 ***</p>\n<p style="text-align: center;"><iframe src="https://www.youtube.com/embed/W41puQNhoDs?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-05-30 12:01:08.669	2025-05-30 12:30:13.268	cmb9f4u7f0000b23cdcloweim	14	cmb9f4u7j0002b23cx07k10oc	\N	아이폰 ***
cmbas3rve0001b24ets5bfbub	아이폰 16 프로 ***	<p>아이폰 16 프로 추천 ***</p>\n<p style="text-align: center;"><iframe src="https://www.youtube.com/embed/W41puQNhoDs?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-05-30 12:28:02.905	2025-05-30 12:36:47.494	cmb9f4u7f0000b23cdcloweim	30	cmb9f4u7j0002b23cx07k10oc	\N	아이폰 16 프로 추천 ***
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, "emailVerified", image, "approvedAt", "createdAt", role, "updatedAt") FROM stdin;
cmb9f56e50003b23cm8bslg6h	user2	user2@gmail.com	$2b$12$DL8QZovK.J.pe53clVNlpelPkRfMslaXhr5EXvozppY5vmuVmI9VS	\N	\N	2025-05-29 13:37:54.87	2025-05-29 13:37:27.197	USER	2025-05-29 13:37:54.871
cmb9f4u7f0000b23cdcloweim	user1	user1@gmail.com	$2b$12$UdSh9Aj7UflUqg3RW3JApOJ1O6jI0F75UUxPUrsoWV3jzJUZ8fECy	\N	\N	2025-05-29 13:38:53.776	2025-05-29 13:37:11.403	USER	2025-05-29 13:38:53.777
cmb9frciq0002b2tqgmyygz68	user3	user3@gmail.com	$2b$12$QKEHn.ZRKX15HOx.rgdqzude9ZGrYqiioN7QPmkORWmHe4Dymc8ZG	\N	\N	\N	2025-05-29 13:54:41.571	PENDING	2025-05-29 13:54:41.571
cmb9bjaex0000b2shlxe8e868	royalkim	fromtoj1@gmail.com	b./PVgYiAKD47.KWeeM9.deO	\N	\N	\N	2025-05-29 11:56:27.129	ADMIN	2025-05-29 11:56:59.788
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
fa7afc58-bb7e-4c99-b745-e69ff352979a	e31f7b2aac86022e173857e376d63f9cf49781b1e5cf76aead9d67eb43d6785a	2025-05-29 20:52:27.670281+09	20250507121127_add_view_count	\N	\N	2025-05-29 20:52:27.653131+09	1
66a3d7c2-9a51-42ed-8cc1-fe617a6e6b1a	1ffbb5c84fbac237d8c65cfa348839cbda0df85269643e04f15199de09e5add6	2025-05-29 20:52:27.675302+09	20250529112336_add_blog_model	\N	\N	2025-05-29 20:52:27.670562+09	1
0ecdb7f7-cbe9-4c01-ad97-5583436223a7	1033bc5327dde427b5243547cf4a152f68f622ec1e4cd9cd76a755e020e96000	2025-05-29 20:52:34.809641+09	20250529115234_add_approved_at	\N	\N	2025-05-29 20:52:34.806508+09	1
7ba28236-6241-48f6-a77e-6c171d5e58ef	a1511aeb5270b8b698c93f6d7646cab73d3b82bab57eb472a12713bca8055d1b	2025-05-30 19:54:52.223452+09	20250530105451_add_post_description	\N	\N	2025-05-30 19:54:52.220993+09	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Blog Blog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Blog_customUrl_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Blog_customUrl_key" ON public."Blog" USING btree ("customUrl");


--
-- Name: Blog_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Blog_userId_key" ON public."Blog" USING btree ("userId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Blog Blog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_blogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES public."Blog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

