import { prisma } from '../db/prisma';

export const termsService = {
    async createTerm(data: { author: string; content: string; }) {
        const { author, content } = data;

        const term = await prisma.terms.create({ data: { author, content } });
        return term;
    },

    async getTerms() {
        const terms = await prisma.terms.findMany();
        return terms;
    },

};