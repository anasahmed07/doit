# Research & Technical Decisions: Phase II - Todo Web Application

**Feature**: Todo Full-Stack Web Application
**Status**: Complete

## 1. Frontend Framework
**Decision**: Next.js 16+ (App Router)
**Rationale**: 
- **Requirement Compliance**: Explicitly requested in the "Technology Stack" section of the Phase 2 requirements.
- **Performance**: Server Components and App Router provide optimized data fetching and rendering.
- **Developer Experience**: Strong TypeScript support and integration with modern tooling.
**Alternatives Considered**: 
- **React (SPA)**: Rejected due to SEO limitations and lack of built-in routing/SSR features standard in Next.js.
- **Vue/Nuxt**: Rejected as the project explicitly mandates Next.js.

## 2. Backend Framework
**Decision**: Python FastAPI
**Rationale**:
- **Requirement Compliance**: Explicitly requested in the "Technology Stack".
- **Performance**: High-performance asynchronous support (ASGI).
- **Type Safety**: Built-in Pydantic integration ensures strict request/response validation, aligning with "API-First & Type-Safe Contracts" principle.
**Alternatives Considered**:
- **Django**: Rejected as too heavyweight for a microservice-oriented, stateless architecture.
- **Flask**: Rejected due to lack of native async support and type validation compared to FastAPI.

## 3. Database & ORM
**Decision**: Neon Serverless PostgreSQL + SQLModel
**Rationale**:
- **Requirement Compliance**: Explicitly requested.
- **Architecture**: Neon's serverless nature aligns with the "Cloud-Native & Stateless" principle.
- **DX**: SQLModel combines Pydantic and SQLAlchemy, allowing shared models for validation and persistence, reducing code duplication.
**Alternatives Considered**:
- **SQLite**: Rejected as not suitable for a scalable, multi-user web application.
- **SQLAlchemy (Raw)**: Rejected in favor of SQLModel for tighter Pydantic integration.

## 4. Authentication
**Decision**: Better Auth
**Rationale**:
- **Requirement Compliance**: Explicitly requested.
- **Security**: Provides secure, framework-agnostic authentication handling (JWT).
- **Integration**: Works well with Next.js and external API backends.
**Alternatives Considered**:
- **NextAuth.js**: Specific to Next.js, but Better Auth was the mandated choice.
- **Custom Auth**: Rejected as implementing custom auth is security-risky ("Secure by Design" principle).

## 5. Styling
**Decision**: Tailwind CSS
**Rationale**:
- **Requirement Compliance**: Explicitly requested.
- **Efficiency**: Utility-first approach speeds up UI development and ensures consistency.
- **Responsiveness**: Built-in support for mobile-first design ("Modern Web Experience").
