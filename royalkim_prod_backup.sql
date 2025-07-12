--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."_PostToTag" DROP CONSTRAINT IF EXISTS "_PostToTag_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_PostToTag" DROP CONSTRAINT IF EXISTS "_PostToTag_A_fkey";
ALTER TABLE IF EXISTS ONLY public."UserDeleteLog" DROP CONSTRAINT IF EXISTS "UserDeleteLog_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Series" DROP CONSTRAINT IF EXISTS "Series_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "Post_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "Post_seriesId_fkey";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "Post_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."Comment" DROP CONSTRAINT IF EXISTS "Comment_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Comment" DROP CONSTRAINT IF EXISTS "Comment_postId_fkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_parentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
DROP INDEX IF EXISTS public."_PostToTag_B_index";
DROP INDEX IF EXISTS public."VerificationToken_token_key";
DROP INDEX IF EXISTS public."VerificationToken_identifier_token_key";
DROP INDEX IF EXISTS public."User_urlId_key";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Tag_name_key";
DROP INDEX IF EXISTS public."Session_sessionToken_key";
DROP INDEX IF EXISTS public."Account_provider_providerAccountId_key";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."_PostToTag" DROP CONSTRAINT IF EXISTS "_PostToTag_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."UserDeleteLog" DROP CONSTRAINT IF EXISTS "UserDeleteLog_pkey";
ALTER TABLE IF EXISTS ONLY public."Tag" DROP CONSTRAINT IF EXISTS "Tag_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."Series" DROP CONSTRAINT IF EXISTS "Series_pkey";
ALTER TABLE IF EXISTS ONLY public."Post" DROP CONSTRAINT IF EXISTS "Post_pkey";
ALTER TABLE IF EXISTS ONLY public."Comment" DROP CONSTRAINT IF EXISTS "Comment_pkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_pkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."_PostToTag";
DROP TABLE IF EXISTS public."VerificationToken";
DROP TABLE IF EXISTS public."UserDeleteLog";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Tag";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."Series";
DROP TABLE IF EXISTS public."Post";
DROP TABLE IF EXISTS public."Comment";
DROP TABLE IF EXISTS public."Category";
DROP TABLE IF EXISTS public."Account";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "parentId" text
);


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "postId" text NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: Post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Post" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    description text,
    "categoryId" text,
    "seriesId" text,
    "seriesOrder" integer,
    "userId" text NOT NULL,
    "categoryIds" text[] DEFAULT ARRAY[]::text[]
);


--
-- Name: Series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Series" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "isPublic" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: Tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tag" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "blogTitle" text,
    "urlId" text
);


--
-- Name: UserDeleteLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserDeleteLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    email text,
    name text,
    "deletedBy" text NOT NULL,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text,
    "roleAtDelete" text
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: _PostToTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_PostToTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, description, "createdAt", "updatedAt", "userId", "isPublic", "parentId") FROM stdin;
cmbz0fuc40001jy040apsb73d	리빙		2025-06-16 11:27:51.122	2025-06-16 11:27:51.122	cmb9f4u7f0000b23cdcloweim	t	\N
cmbz0oo6l0005jy0469ed3iag	키친		2025-06-16 11:34:43.053	2025-06-16 11:34:43.053	cmb9f4u7f0000b23cdcloweim	t	\N
cmchga6g00002js04778h4s7h	가전	디자인도 기능도 최고인 가전 제품을 리뷰합니다.	2025-06-29 09:11:11.87	2025-06-29 09:11:11.87	cmchfnupr0000js042v2xal2y	t	\N
cmchgbsoi0004js042vr7zxef	조명	예쁘고 기능 좋은 조명들을 소개합니다.	2025-06-29 09:12:27.379	2025-06-29 09:12:27.379	cmchfnupr0000js042v2xal2y	t	cmchga6g00002js04778h4s7h
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Comment" (id, content, "createdAt", "updatedAt", "postId", "userId") FROM stdin;
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Post" (id, title, content, published, "createdAt", "updatedAt", "viewCount", description, "categoryId", "seriesId", "seriesOrder", "userId", "categoryIds") FROM stdin;
cmbar56bh0001b2hhd78bnxt3	아이폰 ***	<p>아이폰 ***</p>\n<p style="text-align: center;"><iframe src="https://www.youtube.com/embed/W41puQNhoDs?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-05-30 12:01:08.669	2025-07-03 00:34:21.157	56	아이폰 ***	\N	\N	\N	cmb9f56e50003b23cm8bslg6h	{}
cmcls7ole0001l204n3hgpxe3	렉슨 무드등 2년 이상 장기 사용 후기	<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;"><span style="text-decoration: underline;"><span style="color: #e03e2d; text-decoration: underline;">* 이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span></span></p>\n<p style="text-align: center;"><a title="렉슨 무드등 오디오형" href="https://link.coupang.com/a/cBR2Fw" target="_blank" rel="noopener">https://link.coupang.com/a/cBR2Fw</a></p>\n<p style="text-align: center;"><img src="https://firebasestorage.googleapis.com/v0/b/royalkim.firebasestorage.app/o/image%2F1751188878400_IMG_7556.jpeg?alt=media&amp;token=c155238b-b0bf-4407-b87b-48e7163c8d34" alt="" width="451" height="338"></p>\n<p style="text-align: center;"><a href="https://link.coupang.com/a/cBR2Uh" target="_blank" rel="noopener"><img src="https://image1.coupangcdn.com/image/affiliate/banner/01ee6ce761e5f7226fb2d9c3d2e22e4c@2x.jpg" alt="LEXON 렉슨 MINA L AUDIO 미나 L 오디오 미나 조명+블루투스 스피커 집들이 결혼 선물 - LH76, 실버 - LH76MAP" width="120" height="240"></a></p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;">여러가지 조명을 써봤지만 디자인과 기능을 동시에 만족시키는 제품이 많지 않았는데 유튜브를 보다가 눈에 확 들어온 제품이 바로 렉슨 조명이었습니다.</p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;"><img src="https://firebasestorage.googleapis.com/v0/b/royalkim.firebasestorage.app/o/image%2F1751195699450_IMG_7558.jpeg?alt=media&amp;token=ba47990c-9e7c-4619-b86b-5234c2e30ae1" alt="" width="500" height="370"></p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;">처음에는 디자인이 너무 예뻐서 사봤는데 버섯 모양의 앙증맞은 모양이 눈에 쏙 들어왔어요.</p>\n<p style="text-align: center;">하나씩 사다보니 벌써 세 개나 사버렸네요.</p>\n<p style="text-align: center;">하나는 키스해링과 콜라보 했다길래 한번 봤는데 이것도 사야겠더라구요...</p>\n<p style="text-align: center;">제가 예쁜 거에 좀 약해서요 ㅋ...</p>\n<p style="text-align: center;">사이즈가 L, M, S 세 가지 타입인데 L사이즈도 막상 보면 그렇게 크지 않아요.</p>\n<p style="text-align: center;">하지만 광량은 아주 밝고 광량을 조절할수도 있어서 어두운데서 책을 보거나 밤에 아기 수유할 때도 좋아요.</p>\n<p style="text-align: center;">지인이 출산했을 때 선물했는데 너무 만족하며 잘 쓰고 있다고 하더군요.</p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;"><img src="https://firebasestorage.googleapis.com/v0/b/royalkim.firebasestorage.app/o/image%2F1751192220373_IMG_7554.jpeg?alt=media&amp;token=1e460284-d4dc-48fb-91f4-f452d2ba6d2c" alt="" width="501" height="376"></p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;">크기와 기능에 따라 가격차이가 있어요.</p>\n<p style="text-align: center;">아래 부분에 구멍이 있는 것들은 블루투스 스피커 기능도 있는데 소리는 그렇게 추천할만 하지는 않네요.</p>\n<p style="text-align: center;">하지만 스피커 홀이 없는 밋밋한 디자인보다는 뭔가 포인트가 되어주는 게 더 좋아서 샀습니다.</p>\n<p style="text-align: center;">개인적으로는 실버가 더 예쁘긴 해요.</p>\n<p style="text-align: center;">골드도 예쁘고 모두 마감이 아주 꼼꼼하고 단단하게 잘 되어 있어서 싸구려 느낌은 없어요.</p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;"><img src="https://firebasestorage.googleapis.com/v0/b/royalkim.firebasestorage.app/o/image%2F1751193316093_%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-06-29%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%207.27.21.png?alt=media&amp;token=4cd499cd-58f3-4491-94a3-0ffbc9df9bb7" alt="" width="500" height="370"></p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;">S 사이즈는 너무 소꼽장난감 같아서 사지는 않았구요 M 사이즈도 생각보다 작고 아담해서 좀 당황하긴 했어요.</p>\n<p style="text-align: center;">하지만 만듬새는 아주 좋아요.</p>\n<p style="text-align: center;">S 사이즈는 무선 충전이 안되나봐요.</p>\n<p style="text-align: center;">제가 사용하는 L,M 사이즈들은 무선 충전이 지원돼서 편하게 사용하고 있어요.</p>\n<p style="text-align: center;">무선 충전기는 따로 구입했구요.&nbsp;</p>\n<p style="text-align: center;">너무 고출력 고속 충전되는 것은 고장 우려가 있다고 하니 무선 충전기를 너무 좋은 거 안사도 될 것 같아요.</p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;"><img src="https://firebasestorage.googleapis.com/v0/b/royalkim.firebasestorage.app/o/image%2F1751193672915_IMG_7550.jpeg?alt=media&amp;token=69aa2bf4-cef5-4e1d-9e5b-36c0c0e9f92d" alt="" width="500" height="370"></p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;">이렇게 올려두면 충전도 잘되고 잠깐 잠깐 사용하는 거라 사용하다가 불이 꺼진적은 한번도 없었어요.</p>\n<p style="text-align: center;">완충하면 하루종일 사용해도 된다고 나와 있긴 하네요.</p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;">그냥 보고만 있어도 기분 좋아지는 조명입니다.</p>\n<p style="text-align: center;">결혼 선물과 집들이 선물을 이것으로 했었는데요 반응이 너무너무 좋았어요.</p>\n<p style="text-align: center;">👍👍👍</p>\n<p style="text-align: center;">&nbsp;</p>\n<p style="text-align: center;">내가 사용해도 좋고 선물해도 좋은 인생템이라 더 많은 사람들에게 알리고자 이 글을 쓰게 됐네요.</p>\n<p style="text-align: center;">또 다른 예쁘고 귀엽고 깜찍한 아이템이 뭐가 있나 검색해봐야겠네요.^^</p>	t	2025-07-02 09:56:15.554	2025-07-03 02:36:31.919	10	렉슨 무드등 장기 사용 후기 결혼 집들이 선물 수유등 키스해링 콜라보	\N	\N	\N	cmchfnupr0000js042v2xal2y	{cmchga6g00002js04778h4s7h,cmchgbsoi0004js042vr7zxef}
cmb9fqnbs0001b2tqb9gx4loi	렉슨	<p>렉슨의 예쁜 무드등</p>\n<p><iframe src="https://www.youtube.com/embed/2JKzblGJ1Xk?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-05-29 13:54:08.921	2025-07-03 05:55:19.043	50	\N	\N	\N	\N	cmb9f56e50003b23cm8bslg6h	{}
cmbz0lepa0003jy04ixo0h4af	렉슨	<p>예쁘고 기능도 완벽한 무드램프 렉슨</p>\n<p><iframe src="https://www.youtube.com/embed/2JKzblGJ1Xk?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-06-16 11:32:10.799	2025-07-03 05:55:19.462	54	예쁜 전등 렉슨	cmbz0fuc40001jy040apsb73d	\N	\N	cmb9f4u7f0000b23cdcloweim	{cmbz0fuc40001jy040apsb73d}
cmbz0tbxr0007jy04vw2ybpvi	냉장고	<p>예쁜 냉장고는 어떤게 있을까</p>\n<p><iframe src="https://www.youtube.com/embed/P8mLMbM1Br0?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-06-16 11:38:20.464	2025-07-01 22:59:39.21	84	예쁜 냉장고	cmbz0oo6l0005jy0469ed3iag	\N	\N	cmb9f4u7f0000b23cdcloweim	{cmbz0oo6l0005jy0469ed3iag}
cmbas3rve0001b24ets5bfbub	아이폰 16 프로 ***	<p>아이폰 16 프로 추천 ***</p>\n<p style="text-align: center;"><iframe src="https://www.youtube.com/embed/W41puQNhoDs?feature=shared" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>	t	2025-05-30 12:28:02.905	2025-07-02 23:09:30.102	82	아이폰 16 프로 추천 ***	\N	\N	\N	cmb9f56e50003b23cm8bslg6h	{}
\.


--
-- Data for Name: Series; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Series" (id, title, description, "isPublic", "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tag" (id, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, password, "emailVerified", image, "approvedAt", "createdAt", role, "updatedAt", "deletedAt", "blogTitle", "urlId") FROM stdin;
cmc66gr340001jx04xlomnkqj	Cherry Min	mhyoojk@gmail.com	$2b$12$Pcg9udlaJQd/cGOmE.M/O.YsEtNpZAZ8FLqKlOobwZPQSWmm23aV6	\N	\N	2025-06-21 11:51:33.726	2025-06-21 11:50:54.496	USER	2025-06-21 11:53:13.176	\N	Cherry Min	cherrymin
cmb9bjaex0000b2shlxe8e868	royalkim	fromtoj1@gmail.com	$2b$12$rh/8mLyY5lem0PfWSwl8kOYQFwbXqMa97/BKxZr5zpOOyB6Qw5/xu	\N	\N	\N	2025-05-29 11:56:27.129	ADMIN	2025-06-21 13:56:16.429	\N	\N	royalkim
cmb9f4u7f0000b23cdcloweim	user1	user1@gmail.com	$2b$12$UdSh9Aj7UflUqg3RW3JApOJ1O6jI0F75UUxPUrsoWV3jzJUZ8fECy	\N	\N	2025-05-29 13:38:53.776	2025-05-29 13:37:11.403	USER	2025-06-21 13:56:16.429	\N	user1's blog	user1
cmb9f56e50003b23cm8bslg6h	user2	user2@gmail.com	$2b$12$DL8QZovK.J.pe53clVNlpelPkRfMslaXhr5EXvozppY5vmuVmI9VS	\N	\N	2025-05-29 13:37:54.87	2025-05-29 13:37:27.197	USER	2025-06-21 13:56:16.429	\N	user2's blog	user2
cmb9frciq0002b2tqgmyygz68	user3	user3@gmail.com	$2b$12$QKEHn.ZRKX15HOx.rgdqzude9ZGrYqiioN7QPmkORWmHe4Dymc8ZG	\N	\N	2025-05-31 06:55:54.548	2025-05-29 13:54:41.571	USER	2025-06-21 13:56:16.429	2025-05-31 06:56:30.005	user3's blog	user3
cmc66g9ea0001js04l3937w81	샐리	sallyhmk@icloud.com	$2b$12$YR28RptuRIDZ/JJn3fpuyOhkjDlenDsY4BUtK9wzPXsd.sLd.n5Yq	\N	https://firebasestorage.googleapis.com/v0/b/royalkim.firebasestorage.app/o/logos%2F1750590598092_IMG_4033.jpeg?alt=media&token=4a57f2f4-0d66-4ae1-9650-81ec3d42cfd5	2025-06-21 11:51:35.24	2025-06-21 11:50:31.571	USER	2025-06-22 11:10:03.925	\N	샐리씨	sallysea
cmchfnupr0000js042v2xal2y	coupang	jikimkorea@gmail.com	$2b$12$nd8zii0vNogaOQW4N.FPL.pOaUdZRT8VOBz6jISz/VfCVmoofklIS	\N	https://firebasestorage.googleapis.com/v0/b/royalkim.firebasestorage.app/o/logos%2F1751187227015_%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-06-29%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%205.52.01.png?alt=media&token=cee1d99a-5fd0-41a5-8ba0-8b14d35e5df6	2025-06-29 08:58:52.113	2025-06-29 08:53:50.271	USER	2025-06-29 08:58:52.115	\N	Coupang	coupang
\.


--
-- Data for Name: UserDeleteLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserDeleteLog" (id, "userId", email, name, "deletedBy", "deletedAt", reason, "roleAtDelete") FROM stdin;
cmbbvox7d0001ky042hyeatdq	cmb9frciq0002b2tqgmyygz68	user3@gmail.com	user3	cmb9bjaex0000b2shlxe8e868	2025-05-31 06:56:14.617	승인 거절	USER
cmbbvp93a0003ky04ohu7ujzc	cmb9frciq0002b2tqgmyygz68	user3@gmail.com	user3	cmb9bjaex0000b2shlxe8e868	2025-05-31 06:56:30.022	승인 거절	USER
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _PostToTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_PostToTag" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b929c217-d2f9-44eb-a0d0-6af7db03b440	e31f7b2aac86022e173857e376d63f9cf49781b1e5cf76aead9d67eb43d6785a	2025-05-30 13:21:47.677271+00	20250507121127_add_view_count	\N	\N	2025-05-30 13:21:46.729258+00	1
c52e8371-b891-417a-81ba-3a184ea49c3c	1ffbb5c84fbac237d8c65cfa348839cbda0df85269643e04f15199de09e5add6	2025-05-30 13:21:49.073944+00	20250529112336_add_blog_model	\N	\N	2025-05-30 13:21:48.044781+00	1
b7e1bd70-efb6-44d8-99d7-e27ac5b20aa8	a1511aeb5270b8b698c93f6d7646cab73d3b82bab57eb472a12713bca8055d1b	\N	20250614132701_add_post_description	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250614132701_add_post_description\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "description" of relation "Post" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"description\\" of relation \\"Post\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7478), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250614132701_add_post_description"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250614132701_add_post_description"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-15 12:02:42.412677+00	2025-06-15 12:02:15.748197+00	0
c5ad5d5a-2e81-43d5-9d11-befedf61bb87	1033bc5327dde427b5243547cf4a152f68f622ec1e4cd9cd76a755e020e96000	2025-05-30 13:21:50.3634+00	20250529115234_add_approved_at	\N	\N	2025-05-30 13:21:49.441989+00	1
8ebf9358-4ddd-4add-a44e-6fa3649be6da	a1511aeb5270b8b698c93f6d7646cab73d3b82bab57eb472a12713bca8055d1b	2025-06-15 12:02:42.790251+00	20250614132701_add_post_description		\N	2025-06-15 12:02:42.790251+00	0
fedf8092-5608-4a29-a413-3ea1b6df0fa1	a1511aeb5270b8b698c93f6d7646cab73d3b82bab57eb472a12713bca8055d1b	2025-05-30 13:21:51.662903+00	20250530105451_add_post_description	\N	\N	2025-05-30 13:21:50.732903+00	1
fa7afc58-bb7e-4c99-b745-e69ff352979a	e31f7b2aac86022e173857e376d63f9cf49781b1e5cf76aead9d67eb43d6785a	2025-05-29 11:52:27.670281+00	20250507121127_add_view_count	\N	\N	2025-05-29 11:52:27.653131+00	1
66a3d7c2-9a51-42ed-8cc1-fe617a6e6b1a	1ffbb5c84fbac237d8c65cfa348839cbda0df85269643e04f15199de09e5add6	2025-05-29 11:52:27.675302+00	20250529112336_add_blog_model	\N	\N	2025-05-29 11:52:27.670562+00	1
0ecdb7f7-cbe9-4c01-ad97-5583436223a7	1033bc5327dde427b5243547cf4a152f68f622ec1e4cd9cd76a755e020e96000	2025-05-29 11:52:34.809641+00	20250529115234_add_approved_at	\N	\N	2025-05-29 11:52:34.806508+00	1
7ba28236-6241-48f6-a77e-6c171d5e58ef	a1511aeb5270b8b698c93f6d7646cab73d3b82bab57eb472a12713bca8055d1b	2025-05-30 10:54:52.223452+00	20250530105451_add_post_description	\N	\N	2025-05-30 10:54:52.220993+00	1
8c94ab19-81e0-42d4-94e0-1088790c1886	d9eaf35b42ef685d48d5aa65fe512a4cf622b14ee168090a8e17df85eb5a7025	2025-05-31 06:50:28.58672+00	20250531062002_add_user_delete_log	\N	\N	2025-05-31 06:50:27.552937+00	1
4f7e0976-1c3f-469a-9b2d-d53c3e3200db	00e6ef37d0e2f9d4f10d79e58dbb26ed90a7f79a95282f3bd3a3ae38a0bdc25b	2025-05-31 06:50:29.953013+00	20250531062843_add_role_at_delete_to_user_delete_log_nullable	\N	\N	2025-05-31 06:50:28.976591+00	1
abd3c02d-ad45-471b-a58f-01929174111b	468b23caf04fe9598ad0328440459058b14a5402a25b9022304b9e4898ddc4fe	2025-06-15 11:56:41.874329+00	20250614101922_category_tree	\N	\N	2025-06-15 11:56:40.853538+00	1
965eda7d-f84d-4c29-938a-6d39daab04f2	01233011b7544a2aad8c8e8166afd503986cd92b80cd5aa979dfe3b7ff4329d1	\N	20250614110747_update_category_schema	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250614110747_update_category_schema\n\nDatabase error code: 23502\n\nDatabase error:\nERROR: column "userId" of relation "Post" contains null values\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23502), message: "column \\"userId\\" of relation \\"Post\\" contains null values", detail: None, hint: None, position: None, where_: None, schema: Some("public"), table: Some("Post"), column: Some("userId"), datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(6279), routine: Some("ATRewriteTable") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250614110747_update_category_schema"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250614110747_update_category_schema"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-15 12:01:59.31253+00	2025-06-15 11:56:42.249462+00	0
d911866d-6da6-4ea9-a004-0b68a8efe7bf	01233011b7544a2aad8c8e8166afd503986cd92b80cd5aa979dfe3b7ff4329d1	2025-06-15 12:01:59.685092+00	20250614110747_update_category_schema		\N	2025-06-15 12:01:59.685092+00	0
66ddea76-d267-4f56-8f95-c259ad88cbc5	28fc50cc3d131d4c6b6924fadb3cace10f58b7e8c39e6093738792b2485e4c9a	\N	20250614133311_add_post_view_count	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250614133311_add_post_view_count\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "viewCount" of relation "Post" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"viewCount\\" of relation \\"Post\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7478), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250614133311_add_post_view_count"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250614133311_add_post_view_count"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-15 12:03:21.463014+00	2025-06-15 12:02:57.091229+00	0
b42d1547-6361-4114-8d01-b16869dd4a65	28fc50cc3d131d4c6b6924fadb3cace10f58b7e8c39e6093738792b2485e4c9a	2025-06-15 12:03:21.838833+00	20250614133311_add_post_view_count		\N	2025-06-15 12:03:21.838833+00	0
ecd97470-d3c5-4461-bf23-0a7aa3ae8ffe	46a328fd6adf0c514ed8e9ad4c7542a4f403c0bf5bbe6195953b6915735b2a33	2025-06-16 09:52:35.201475+00	20250616095221_add_blog_model	\N	\N	2025-06-16 09:52:34.189143+00	1
da574651-134f-4137-b2f5-c2234026c7d0	abaaa7bf12c0731408773c9bd816b4c8a81736550c9b66baa9f99b4ea850b82f	2025-06-16 10:00:57.503775+00	20250616100042_add_blog_title_to_user	\N	\N	2025-06-16 10:00:56.513285+00	1
04808927-e5b4-4cf2-a122-c8683f9c6dfd	ba30dd05ce5a914c9d842a03ea1088b91197a1d8bba3ba151182160b39daf308	2025-06-19 12:18:35.89587+00	20250618111702_add_user_url_id	\N	\N	2025-06-19 12:18:34.920612+00	1
ba43f169-251c-47e3-9813-8735b12f1775	dc124034ae0133b1493847d045e6ed21c6bf93a6d5a223c8488648a81586e428	2025-06-25 12:00:52.380669+00	20250625103928_add_category_ids_array	\N	\N	2025-06-25 12:00:51.416788+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: Series Series_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Series"
    ADD CONSTRAINT "Series_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: UserDeleteLog UserDeleteLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDeleteLog"
    ADD CONSTRAINT "UserDeleteLog_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _PostToTag _PostToTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PostToTag"
    ADD CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_urlId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_urlId_key" ON public."User" USING btree ("urlId");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: _PostToTag_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_PostToTag_B_index" ON public."_PostToTag" USING btree ("B");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Post Post_seriesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES public."Series"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Post Post_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Series Series_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Series"
    ADD CONSTRAINT "Series_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserDeleteLog UserDeleteLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDeleteLog"
    ADD CONSTRAINT "UserDeleteLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _PostToTag _PostToTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PostToTag"
    ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PostToTag _PostToTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PostToTag"
    ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

