import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrincipalModule } from './principal/principal.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteersModule } from './volunteers/volunteers.module';
import { PersonalModule } from './personal/personal.module';
import { FaqModule } from './faq/faq.module';
import { ServicesInformativeModule } from './servicesInformative/servicesInformative.module';
import { AboutUsModule } from './aboutUs/aboutUs.module';
import { EventModule } from './event/event.module';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { ConfigModule } from '@nestjs/config';
import { RealtimeModule } from './realtime/realtime.module';
import { DepartmentModule } from './anualBudget/department/department.module';
import { FiscalYearModule } from './anualBudget/fiscalYear/fiscal-year.module';
import { IncomeTypeModule } from './anualBudget/incomeType/income-type.module';
import { IncomeSubTypeModule } from './anualBudget/incomeSubType/income-sub-type.module';
import { IncomeTypeByDepartmentModule } from './anualBudget/incomeTypeByDeparment/income-type-by-department.module';
import { SpendTypeModule } from './anualBudget/spendType/spend-type.module';
import { SpendSubTypeModule } from './anualBudget/spendSubType/spend-sub-type.module';
import { SpendTypeByDepartmentModule } from './anualBudget/spendTypeByDepartment/spend-type-by-department.module';
import { TotalSumModule } from './anualBudget/totalSum/total-sum.module';
import { IncomeModule } from './anualBudget/income/income.module';
import { SpendModule } from './anualBudget/spend/spend.module';
import { PIncomeModule } from './anualBudget/pIncome/pIncome.module';
import { PIncomeTypeByDepartmentModule } from './anualBudget/pIncomeTypeByDeparment/p-income-type-by-department.module';
import { PIncomeTypeModule } from './anualBudget/pIncomeType/pincome-type.module';
import { PIncomeSubTypeModule } from './anualBudget/pIncomeSubType/pincome-sub-type.module';
import { HomeModule } from './anualBudget/home/home.module';
import { PTotalSumModule } from './anualBudget/pTotalSum/p-total-sum.module';
import { PSpendModule } from './anualBudget/pSpend/p-spend.module';
import { PSpendTypeModule } from './anualBudget/pSpendType/p-spend-type.module';
import { PSpendSubTypeModule } from './anualBudget/pSpendSubType/p-spend-sub-type.module';
import { PSpendTypeByDepartmentModule } from './anualBudget/pSpendTypeByDepartment/p-spend-type-by-department.module';
import { ExtraordinaryModule } from './anualBudget/extraordinary/extraordinary.module';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './anualBudget/report/report.module';
import { ReportProjectionsModule } from './anualBudget/reportProjections/reportProjections.module';
import { ReportExtraModule } from './anualBudget/reportExtraordinary/reportExtra.module';
import { AssociatesPageModule } from './editInformative/associatesPage/associates-page.module';
import { VolunteersPageModule } from './editInformative/volunteersPage/volunteers-page-module';
import { FincaModule } from './formFinca/finca/finca.module';
import { AssociateModule } from './formAssociates/associate/associate.module';
import { PersonaModule } from './formAssociates/persona/persona.module';
import { SolicitudModule } from './formAssociates/solicitud/solicitud.module';
import { PropietarioModule } from './formAssociates/propietario/propietario.module';
import { NucleoFamiliarModule } from './formAssociates/nucleo-familiar/nucleo-familiar.module';
import { RegistrosProductivosModule } from './formFinca/registros-productivos/registros-productivos.module';
import { GeografiaModule } from './formFinca/geografia/geografia.module';
import { InfraestructurasModule } from './formFinca/infraestructura/infraestructura.module';
import { FincaInfraestructurasModule } from './formFinca/finca-infraestructura/fincaInfraestructura.module';
import { TiposCercaModule } from './formFinca/tipo-cerca/tipo-cerca.module';
import { FincaTipoCercaModule } from './formFinca/finca-tipo-cerca/finca-tipo-cerca.module';
import { CanalesComercializacionModule } from './formFinca/canal-comercializacion/canal.module';
//import { CorrienteElectricaModule } from './formFinca/corriente-electrica/corriente.module';



@Module({
  imports: [
    // Throttler lo implementaremos luego como en los formularios 
    ThrottlerModule.forRoot([
      {
        name: 'login',    // política con nombre
        ttl: 120_000,     // ✅ 2 minutos en MILISEGUNDOS
        limit: 5,         // 5 intentos por ventana
      },
    ]),

    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123',
      database: 'cgh_database',
      autoLoadEntities: true,
      synchronize: true,
    }),

    // 👇 cada módulo es un elemento independiente del array
    RealtimeModule,
    PrincipalModule,
    VolunteersModule,
    PersonalModule,
    FaqModule,
    AuthModule,
    ServicesInformativeModule,
    AboutUsModule,
    EventModule,
    UsersModule,
    RoleModule,  
    DepartmentModule,  
    FiscalYearModule,
    IncomeTypeModule,
    IncomeSubTypeModule,
    IncomeTypeByDepartmentModule,
    SpendTypeModule,
    SpendSubTypeModule,
    SpendTypeByDepartmentModule,
    TotalSumModule,
    IncomeModule,
    SpendModule,
    PIncomeModule,
    PIncomeTypeByDepartmentModule,
    PIncomeTypeModule,
    PIncomeSubTypeModule,
    HomeModule,
    PTotalSumModule,
    PSpendModule,
    PSpendTypeModule,
    PSpendSubTypeModule,
    PSpendTypeByDepartmentModule,
    ExtraordinaryModule,
    AuthModule,
    ReportModule,
    ReportProjectionsModule,
    ReportExtraModule,  
    AssociatesPageModule,
    AssociateModule,
    VolunteersPageModule,
    VolunteersModule,
    FincaModule,
    PersonaModule,
    SolicitudModule,
    PropietarioModule,
    NucleoFamiliarModule,
    RegistrosProductivosModule,
    GeografiaModule,
    InfraestructurasModule,
    FincaInfraestructurasModule,
    TiposCercaModule,
    FincaTipoCercaModule,
    CanalesComercializacionModule,
    //CorrienteElectricaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}
