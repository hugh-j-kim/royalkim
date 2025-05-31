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

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."User" VALUES ('cmb9f56e50003b23cm8bslg6h', 'user2', 'user2@gmail.com', '$2b$12$DL8QZovK.J.pe53clVNlpelPkRfMslaXhr5EXvozppY5vmuVmI9VS', NULL, NULL, '2025-05-29 13:37:54.87', '2025-05-29 13:37:27.197', 'USER', '2025-05-29 13:37:54.871');
INSERT INTO public."User" VALUES ('cmb9f4u7f0000b23cdcloweim', 'user1', 'user1@gmail.com', '$2b$12$UdSh9Aj7UflUqg3RW3JApOJ1O6jI0F75UUxPUrsoWV3jzJUZ8fECy', NULL, NULL, '2025-05-29 13:38:53.776', '2025-05-29 13:37:11.403', 'USER', '2025-05-29 13:38:53.777');
INSERT INTO public."User" VALUES ('cmb9frciq0002b2tqgmyygz68', 'user3', 'user3@gmail.com', '$2b$12$QKEHn.ZRKX15HOx.rgdqzude9ZGrYqiioN7QPmkORWmHe4Dymc8ZG', NULL, NULL, NULL, '2025-05-29 13:54:41.571', 'PENDING', '2025-05-29 13:54:41.571');
INSERT INTO public."User" VALUES ('cmb9bjaex0000b2shlxe8e868', 'royalkim', 'fromtoj1@gmail.com', 'b./PVgYiAKD47.KWeeM9.deO', NULL, NULL, NULL, '2025-05-29 11:56:27.129', 'ADMIN', '2025-05-29 11:56:59.788');


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Blog; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Blog" VALUES ('cmb9bjaez0002b2shi0ndvcnx', 'royalkim의 블로그', 'royalkim의 블로그에 오신 것을 환영합니다.', '2025-05-29 11:56:27.132', '2025-05-29 11:56:27.132', 'cmb9bjaex0000b2shlxe8e868', true, 'royalkim-blog');
INSERT INTO public."Blog" VALUES ('cmb9f4u7j0002b23cx07k10oc', 'user1의 블로그', 'user1의 블로그에 오신 것을 환영합니다.', '2025-05-29 13:37:11.407', '2025-05-29 13:37:11.407', 'cmb9f4u7f0000b23cdcloweim', true, 'user1-blog');
INSERT INTO public."Blog" VALUES ('cmb9f56e60005b23c0wx1esi6', 'user2의 블로그', 'user2의 블로그에 오신 것을 환영합니다.', '2025-05-29 13:37:27.198', '2025-05-29 13:37:27.198', 'cmb9f56e50003b23cm8bslg6h', true, 'user2-blog');
INSERT INTO public."Blog" VALUES ('cmb9frcis0004b2tq5j7cf7bq', 'user3의 블로그', 'user3의 블로그에 오신 것을 환영합니다.', '2025-05-29 13:54:41.573', '2025-05-29 13:54:41.573', 'cmb9frciq0002b2tqgmyygz68', true, 'user3-blog');


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Post" VALUES ('cmb9fqnbs0001b2tqb9gx4loi', '렉슨', '<p>렉슨의 예쁜 무드등</p>
<p><iframe src="https://www.youtube.com/embed/2JKzblGJ1Xk?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>', true, '2025-05-29 13:54:08.921', '2025-05-29 13:54:08.921', 'cmb9bjaex0000b2shlxe8e868', 0, 'cmb9bjaez0002b2shi0ndvcnx', NULL, NULL);
INSERT INTO public."Post" VALUES ('cmbar56bh0001b2hhd78bnxt3', '아이폰 ***', '<p>아이폰 ***</p>
<p style="text-align: center;"><iframe src="https://www.youtube.com/embed/W41puQNhoDs?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>', true, '2025-05-30 12:01:08.669', '2025-05-30 12:30:13.268', 'cmb9f4u7f0000b23cdcloweim', 14, 'cmb9f4u7j0002b23cx07k10oc', NULL, '아이폰 ***');
INSERT INTO public."Post" VALUES ('cmbas3rve0001b24ets5bfbub', '아이폰 16 프로 ***', '<p>아이폰 16 프로 추천 ***</p>
<p style="text-align: center;"><iframe src="https://www.youtube.com/embed/W41puQNhoDs?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>', true, '2025-05-30 12:28:02.905', '2025-05-30 12:36:47.494', 'cmb9f4u7f0000b23cdcloweim', 30, 'cmb9f4u7j0002b23cx07k10oc', NULL, '아이폰 16 프로 추천 ***');


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('fa7afc58-bb7e-4c99-b745-e69ff352979a', 'e31f7b2aac86022e173857e376d63f9cf49781b1e5cf76aead9d67eb43d6785a', '2025-05-29 20:52:27.670281+09', '20250507121127_add_view_count', NULL, NULL, '2025-05-29 20:52:27.653131+09', 1);
INSERT INTO public._prisma_migrations VALUES ('66a3d7c2-9a51-42ed-8cc1-fe617a6e6b1a', '1ffbb5c84fbac237d8c65cfa348839cbda0df85269643e04f15199de09e5add6', '2025-05-29 20:52:27.675302+09', '20250529112336_add_blog_model', NULL, NULL, '2025-05-29 20:52:27.670562+09', 1);
INSERT INTO public._prisma_migrations VALUES ('0ecdb7f7-cbe9-4c01-ad97-5583436223a7', '1033bc5327dde427b5243547cf4a152f68f622ec1e4cd9cd76a755e020e96000', '2025-05-29 20:52:34.809641+09', '20250529115234_add_approved_at', NULL, NULL, '2025-05-29 20:52:34.806508+09', 1);
INSERT INTO public._prisma_migrations VALUES ('7ba28236-6241-48f6-a77e-6c171d5e58ef', 'a1511aeb5270b8b698c93f6d7646cab73d3b82bab57eb472a12713bca8055d1b', '2025-05-30 19:54:52.223452+09', '20250530105451_add_post_description', NULL, NULL, '2025-05-30 19:54:52.220993+09', 1);


--
-- PostgreSQL database dump complete
--

