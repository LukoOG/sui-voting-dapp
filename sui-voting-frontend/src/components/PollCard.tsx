interface PollCardProps {
	title: string
}


export default PollCard({ title }:PollCardProps){
return (
		<Card className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-[var(--shadow-glow)] transition rounded-2xl">
			<CardContent className="p-4 flex flex-col gap-2">
				
				<h2 className="text-lg font-semibold">{ title }</h2>
				<p className="text-[var(--color-muted)]">Which do you prefer?</p>
				
				<div className="flex flex-col gap-2 mt-2">
					<Button variant="outline">Option A</Button>
					<Button variant="outline">Option B</Button>
				</div>
				
			</CardContent>
		</Card>
	)
}