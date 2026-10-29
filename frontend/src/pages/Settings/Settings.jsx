const SettingsPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <header className="border-border border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Aqui vai ficar as configurações
        </p>
      </header>

      <main className="border-border bg-card text-card-foreground flex flex-col gap-4 rounded-none border p-6"></main>
    </div>
  );
};

export default SettingsPage;
