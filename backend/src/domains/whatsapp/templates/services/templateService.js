const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saveTemplateToDB = async (template) => {
    console.log("saveTemplateToDB");
    try {
        const saved = await prisma.template.upsert({
            where: { id_meta: template.id_meta },
            update: {
                category: template.category,
                language: template.language,
                status: template.status,
                id_meta: template.id
            },
            create: {
                name: template.name,
                category: template.category,
                language: template.language,
                status: template.status,
                id_meta: template.id
            }
        });
        return saved;
    } catch (error) {
        console.error('❌ Error guardando plantilla:', template.name, error);
        return null;
    }
};

const saveComponentToDB = async (component, templateId) => {
    console.log("saveComponentToDB");

    // Evitar componentes duplicados
    const existingComponent = await prisma.component.findFirst({
        where: {
            type: component.type,
            format: component.format || '',
            text: component.text || '',
            templateId: templateId
        }
    });

    const savedComponent = existingComponent || await prisma.component.create({
        data: {
            type: component.type,
            format: component.format || '',
            text: component.text || '',
            example: component.example?.body_text ? JSON.stringify(component.example.body_text) : null,
            template: { connect: { id: parseInt(templateId) } }
        }
    });

    if (component.type === 'BUTTONS' && component.buttons?.length) {
        for (const btn of component.buttons) {
            await prisma.button.create({
                data: {
                    type: btn.type,
                    text: btn.text,
                    url: btn.url || null,
                    example: btn.example ? JSON.stringify(btn.example) : null,
                    component: { connect: { id: savedComponent.id } }
                }
            });
        }
    }

    return savedComponent;
};

const getTemplatesFromDB = async () => {
    return await prisma.template.findMany({
        include: {
            components: {
                include: {
                    buttons: true
                }
            }
        }
    });
};

const getTemplateByIdFromDB = async (id) => {
    return await prisma.template.findUnique({
        where: { id_meta: id },
        include: {
            components: {
                include: {
                    buttons: true
                }
            }
        }
    });
};

const deleteTemplateFromDB = async (id) => {
    try {
        const template = await prisma.template.findUnique({
            where: { id_meta: id },
            include: {
                components: {
                    include: {
                        buttons: true
                    }
                }
            }
        });

        if (!template) {
            throw new Error("Plantilla no encontrada en la base de datos");
        }

        // 2. Eliminar botones de cada componente
        for (const component of template.components) {
            await prisma.button.deleteMany({
                where: { componentId: component.id }
            });
        }

        // 3. Eliminar componentes
        await prisma.component.deleteMany({
            where: { templateId: template.id }
        });

        // 4. Eliminar plantilla
        const deletedTemplate = await prisma.template.delete({
            where: { id: template.id }
        });

        return deletedTemplate;
    } catch (error) {
        console.error('❌ Error eliminando plantilla:', error);
        throw error;
    }
}

module.exports = {
    saveTemplateToDB,
    saveComponentToDB,
    getTemplatesFromDB,
    getTemplateByIdFromDB,
    deleteTemplateFromDB
};